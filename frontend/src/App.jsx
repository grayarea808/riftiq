import { useState } from "react";

const REGIONS = [
  { value: "na1", label: "NA" },
  { value: "euw1", label: "EUW" },
  { value: "eun1", label: "EUNE" },
  { value: "kr", label: "KR" },
  { value: "br1", label: "BR" },
  { value: "la1", label: "LAN" },
  { value: "la2", label: "LAS" },
  { value: "oc1", label: "OCE" },
  { value: "tr1", label: "TR" },
  { value: "ru", label: "RU" },
  { value: "jp1", label: "JP" },
];

const RANK_COLORS = {
  IRON: "#8B6F5E",
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#00FFCC",
  EMERALD: "#50C878",
  DIAMOND: "#B9F2FF",
  MASTER: "#9B59B6",
  GRANDMASTER: "#E74C3C",
  CHALLENGER: "#F0E68C",
};

export default function App() {
  const [summonerName, setSummonerName] = useState("");
  const [tagline, setTagline] = useState("NA1");
  const [region, setRegion] = useState("na1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [paid, setPaid] = useState(true);

  const handleSubmit = async () => {
    if (!summonerName.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    setPlayerData(null);
    

    try {
      const res = await fetch("https://riftiq-production.up.railway.app/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summonerName: summonerName.trim(), tagline: tagline.trim(), region }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setPlayerData(data.playerData);
      setReport(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch("https://riftiq-production.up.railway.app/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summonerName, region }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Checkout failed. Try again.");
    }
  };

  const rankColor = playerData ? RANK_COLORS[playerData.tier] || "#888" : "#888";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e8eaf0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e2540", padding: "1.25rem 2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #c89b3c, #e8c96a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚔</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
          Rift<span style={{ color: "#c89b3c" }}>IQ</span>
        </span>
        <div style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#6b7394", background: "#131829", border: "1px solid #1e2540", borderRadius: 6, padding: "0.3rem 0.75rem" }}>
          AI-Powered Coaching
        </div>
      </header>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "4rem 1.5rem 2.5rem" }}>
        <div style={{ display: "inline-block", background: "#131829", border: "1px solid #c89b3c33", borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: "#c89b3c", marginBottom: "1.25rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Diamond-Level Analysis
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 1rem", lineHeight: 1.1 }}>
          Stop Guessing.<br />
          <span style={{ color: "#c89b3c" }}>Start Climbing.</span>
        </h1>
        <p style={{ color: "#6b7394", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          Enter your summoner name and get a personalized AI coaching report based on your actual match data.
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: 580, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              style={{ background: "#131829", border: "1px solid #1e2540", borderRadius: 10, color: "#e8eaf0", padding: "0.85rem 0.75rem", fontSize: "0.9rem", cursor: "pointer", minWidth: 80 }}
            >
              {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <input
              type="text"
              placeholder="Summoner name"
              value={summonerName}
              onChange={e => setSummonerName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ flex: 1, background: "#131829", border: "1px solid #1e2540", borderRadius: 10, color: "#e8eaf0", padding: "0.85rem 1.1rem", fontSize: "0.95rem", outline: "none" }}
            />
            <input
              type="text"
              placeholder="Tag (e.g. NA1)"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              style={{ width: 110, background: "#131829", border: "1px solid #1e2540", borderRadius: 10, color: "#e8eaf0", padding: "0.85rem 0.75rem", fontSize: "0.95rem", outline: "none" }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !summonerName.trim()}
            style={{ background: loading ? "#1e2540" : "linear-gradient(135deg, #c89b3c, #e8c96a)", border: "none", borderRadius: 10, color: loading ? "#6b7394" : "#0a0e1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", padding: "0.9rem", cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s", letterSpacing: "0.02em" }}
          >
            {loading ? "Analyzing your games..." : "Analyze My Account →"}
          </button>
        </div>

        {error && (
          <div style={{ maxWidth: 580, margin: "1rem auto 0", background: "#2a1020", border: "1px solid #5a1030", borderRadius: 10, padding: "0.85rem 1.1rem", color: "#ff6b8a", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
      </div>

      {/* Player card + report */}
      {playerData && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
          {/* Player summary */}
          <div style={{ background: "#131829", border: "1px solid #1e2540", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7394", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>Summoner</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>{playerData.name}</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7394", marginTop: "0.25rem" }}>#{playerData.tagline} · {playerData.region?.toUpperCase()}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7394", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Rank</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: rankColor }}>{playerData.tier} {playerData.rank}</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7394" }}>{playerData.lp} LP</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7394", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Win Rate</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: parseFloat(playerData.winRate) >= 50 ? "#50C878" : "#ff6b8a" }}>{playerData.winRate}%</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7394" }}>{playerData.wins}W {playerData.losses}L</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7394", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Last 20 Games</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>{playerData.recentWins}W {playerData.recentLosses}L</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7394" }}>KDA {playerData.avgKda}</div>
            </div>
          </div>

          {/* Top champions */}
          {playerData.topChampions?.length > 0 && (
            <div style={{ background: "#131829", border: "1px solid #1e2540", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#6b7394", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Top Champions (Recent)</div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {playerData.topChampions.map((champ, i) => (
                  <div key={i} style={{ background: "#0a0e1a", border: "1px solid #1e2540", borderRadius: 10, padding: "0.6rem 1rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{champ.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7394" }}>{champ.games} games · {champ.winRate}% WR</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report section */}
          <div style={{ background: "#131829", border: "1px solid #1e2540", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #1e2540", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1rem" }}>📊</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem" }}>AI Coaching Report</span>
              {!paid && (
                <span style={{ marginLeft: "auto", background: "#c89b3c22", border: "1px solid #c89b3c55", color: "#c89b3c", fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preview</span>
              )}
            </div>

            {/* Preview (always visible) */}
            <div style={{ padding: "1.5rem" }}>
              <div style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#b0b8d0" }}>
                {report?.preview}
              </div>

              {/* Paywall blur */}
              {!paid && (
                <>
                  <div style={{ marginTop: "1.5rem", position: "relative" }}>
                    <div style={{ filter: "blur(5px)", userSelect: "none", fontSize: "0.9rem", lineHeight: 1.8, color: "#b0b8d0" }}>
                      {report?.fullReport?.slice(0, 400)}...
                    </div>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #131829 70%)", borderRadius: 8 }} />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <div style={{ fontSize: "0.9rem", color: "#6b7394", marginBottom: "1rem" }}>
                      Unlock your <strong style={{ color: "#e8eaf0" }}>full coaching report</strong> — macro breakdown, champion pool, and your #1 drill this week.
                    </div>
                    <button
                      onClick={handleCheckout}
                      style={{ background: "linear-gradient(135deg, #c89b3c, #e8c96a)", border: "none", borderRadius: 10, color: "#0a0e1a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", padding: "0.85rem 2rem", cursor: "pointer", letterSpacing: "0.02em" }}
                    >
                      Unlock Full Report — $4.99
                    </button>
                    <div style={{ fontSize: "0.75rem", color: "#6b7394", marginTop: "0.75rem" }}>One-time · Instant access · Powered by Claude AI</div>
                  </div>
                </>
              )}

              {/* Full report (after payment) */}
              {paid && (
                <div style={{ marginTop: "1.5rem", fontSize: "0.9rem", lineHeight: 1.8, color: "#b0b8d0", whiteSpace: "pre-wrap" }}>
                  {report?.fullReport}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      {!playerData && !loading && (
        <div style={{ maxWidth: 720, margin: "0 auto 4rem", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "🔍", title: "Enter your name", desc: "We pull your last 20 ranked games live from Riot's API" },
              { icon: "🧠", title: "AI analyzes your data", desc: "Claude identifies patterns, weak spots, and strengths" },
              { icon: "📈", title: "Get your report", desc: "Specific macro tips, champion recs, and a weekly drill" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#131829", border: "1px solid #1e2540", borderRadius: 14, padding: "1.5rem" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{item.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: "0.4rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.85rem", color: "#6b7394", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ borderTop: "1px solid #1e2540", padding: "1.5rem 2rem", textAlign: "center", fontSize: "0.8rem", color: "#3a4060" }}>
        RiftIQ is not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.
      </footer>
    </div>
  );
}
