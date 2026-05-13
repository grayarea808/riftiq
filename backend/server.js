import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Riot API helpers ────────────────────────────────────────────────────────

const ROUTING = {
  na1: "americas", euw1: "europe", eun1: "europe", kr: "asia",
  br1: "americas", la1: "americas", la2: "americas",
  oc1: "sea", tr1: "europe", ru: "europe", jp1: "asia",
};

const riotFetch = async (url) => {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
  });
  console.log(`Riot API: ${res.status} ${url}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.status?.message || `Riot API error ${res.status}`);
  }
  return res.json();
};

async function getPlayerData(summonerName, tagline, region) {
  const routing = ROUTING[region] || "americas";

  // 1. Get PUUID via Riot Account API
  const account = await riotFetch(
    `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagline)}`
  );
  const puuid = account.puuid;

  // 2. Get summoner info
  const summoner = await riotFetch(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
  );

  // 3. Get ranked stats
  const rankedData = await riotFetch(
  `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
);
console.log("Summoner ID:", summoner.id);
const soloQ = rankedData.find((e) => e.queueType === "RANKED_SOLO_5x5") || {};

  // 4. Get last 20 ranked match IDs
  const matchIds = await riotFetch(
    `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=10`
  );

  // 5. Fetch match details in parallel (up to 20)
  const matches = await Promise.all(
    matchIds.slice(0, 20).map((id) =>
      riotFetch(`https://${routing}.api.riotgames.com/lol/match/v5/matches/${id}`)
    )
  );

  // 6. Process match data
  const playerStats = matches.map((match) => {
    const participant = match.info.participants.find((p) => p.puuid === puuid);
    if (!participant) return null;
    return {
      champion: participant.championName,
      win: participant.win,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
      gameDuration: match.info.gameDuration / 60,
      visionScore: participant.visionScore,
      role: participant.teamPosition,
      killParticipation:
        ((participant.kills + participant.assists) /
          Math.max(1, match.info.participants
            .filter((p) => p.teamId === participant.teamId)
            .reduce((sum, p) => sum + p.kills, 0))) * 100,
    };
  }).filter(Boolean);

  // 7. Aggregate stats
  const wins = playerStats.filter((g) => g.win).length;
  const losses = playerStats.length - wins;
  const avgKda = playerStats.length
    ? (
        playerStats.reduce((sum, g) => sum + (g.kills + g.assists) / Math.max(1, g.deaths), 0) /
        playerStats.length
      ).toFixed(2)
    : "0.00";
  const avgCsPerMin = playerStats.length
    ? (
        playerStats.reduce((sum, g) => sum + g.cs / Math.max(1, g.gameDuration), 0) /
        playerStats.length
      ).toFixed(1)
    : "0.0";
  const avgVision = playerStats.length
    ? (playerStats.reduce((sum, g) => sum + g.visionScore, 0) / playerStats.length).toFixed(1)
    : "0.0";
  const avgKp = playerStats.length
    ? (playerStats.reduce((sum, g) => sum + g.killParticipation, 0) / playerStats.length).toFixed(1)
    : "0.0";

  // 8. Top champions
  const champMap = {};
  playerStats.forEach((g) => {
    if (!champMap[g.champion]) champMap[g.champion] = { games: 0, wins: 0 };
    champMap[g.champion].games++;
    if (g.win) champMap[g.champion].wins++;
  });
  const topChampions = Object.entries(champMap)
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, 5)
    .map(([name, stats]) => ({
      name,
      games: stats.games,
      winRate: ((stats.wins / stats.games) * 100).toFixed(0),
    }));

  return {
    name: summonerName,
    tagline,
    region,
    tier: soloQ.tier || "UNRANKED",
    rank: soloQ.rank || "",
    lp: soloQ.leaguePoints || 0,
    wins: soloQ.wins || 0,
    losses: soloQ.losses || 0,
    winRate: soloQ.wins
      ? ((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100).toFixed(1)
      : "0.0",
    recentWins: wins,
    recentLosses: losses,
    avgKda,
    avgCsPerMin,
    avgVisionScore: avgVision,
    avgKillParticipation: avgKp,
    topChampions,
    gamesAnalyzed: playerStats.length,
    roles: [...new Set(playerStats.map((g) => g.role).filter(Boolean))],
  };
}

// ─── Claude prompt ───────────────────────────────────────────────────────────

function buildPrompt(player) {
  return `You are a Challenger-level League of Legends coach writing a personal breakdown for one of your students. Write like a real coach talking directly to the player — honest, specific, and direct. No fluff. Reference their actual numbers throughout.

PLAYER DATA:
- Summoner: ${player.name} (${player.tier} ${player.rank}, ${player.lp} LP)
- Season: ${player.wins}W ${player.losses}L (${player.winRate}% WR)
- Last ${player.gamesAnalyzed} games: ${player.recentWins}W ${player.recentLosses}L
- KDA: ${player.avgKda} | CS/min: ${player.avgCsPerMin} | Vision: ${player.avgVisionScore} | Kill Participation: ${player.avgKillParticipation}%
- Champions: ${player.topChampions.map((c) => `${c.name} (${c.games}g, ${c.winRate}% WR)`).join(", ")}
- Roles: ${player.roles.join(", ") || "Unknown"}

Write the breakdown using these sections. Sound like a person, not a report generator:

**OVERVIEW**
2-3 sentences. What do their numbers actually say about their playstyle? Be blunt.

**TOP 3 MISTAKES**
For each one: name it plainly, explain what the stat reveals, and what it costs them in games. Use their actual numbers. No generic advice.

**CHAMPION POOL**
Tell them what to keep, what to drop, and what to add with a real reason for each.

**ONE THING TO DRILL THIS WEEK**
One specific habit. Make it concrete enough that they can do it their very next game.

**WIN CONDITION FOR YOUR ELO**
What does a ${player.tier} ${player.rank} player need to consistently do that they probably are not? Be honest.

Keep it under 600 words. Write like you are talking to them, not filing a report.`;


// ─── Routes ──────────────────────────────────────────────────────────────────

// Main analysis endpoint
app.post("/api/analyze", async (req, res) => {
  const { summonerName, tagline, region } = req.body;

  if (!summonerName || !tagline || !region) {
    return res.status(400).json({ error: "Missing summoner name, tagline, or region" });
  }

  try {
    // Fetch player data from Riot
    const playerData = await getPlayerData(summonerName, tagline, region);

    // Generate report via Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(playerData) }],
    });

    const fullReport = message.content[0].text;

    // Split into preview (first section only) + full
    const overviewMatch = fullReport.match(/\*\*OVERVIEW\*\*([\s\S]*?)(?=\*\*TOP 3)/);
    const preview = overviewMatch
      ? `**OVERVIEW**${overviewMatch[1].trim()}`
      : fullReport.slice(0, 300) + "...";

    res.json({
      playerData,
      report: { preview, fullReport },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Stripe checkout
app.post("/api/checkout", async (req, res) => {
  const { summonerName, region } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "RiftIQ Coaching Report",
              description: `Full AI coaching report for ${summonerName} (${region.toUpperCase()})`,
            },
            unit_amount: 499, // $4.99
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/?success=true&summoner=${encodeURIComponent(summonerName)}`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
      metadata: { summonerName, region },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
