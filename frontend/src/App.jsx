import { useState, useEffect } from "react";

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
  IRON: "#8B6F5E", BRONZE: "#CD7F32", SILVER: "#C0C0C0",
  GOLD: "#FFD700", PLATINUM: "#00FFCC", EMERALD: "#50C878",
  DIAMOND: "#B9F2FF", MASTER: "#9B59B6", GRANDMASTER: "#E74C3C", CHALLENGER: "#F0E68C",
};

const API_URL = "https://riftiq-production.up.railway.app";

export default function App() {
  const [summonerName, setSummonerName] = useState("");
  const [tagline, setTagline] = useState("NA1");
  const [region, setRegion] = useState("na1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [paid, setPaid] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async () => {
    if (!summonerName.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    setPlayerData(null);
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
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

  const rankColor = playerData ? RANK_COLORS[playerData.tier] || "#888" : "#888";

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, button { font-family: 'Inter', sans-serif; }
        input:focus, select:focus { outline: none; border-color: #c8a84b !important; }
        .nav-link { color: #8b949e; font-size: 0.8rem; font-weight: 600; text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s; cursor: pointer; }
        .nav-link:hover { color: #e6edf3; }
        .search-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #e6edf3; padding: 0.75rem 1rem; font-size: 0.95rem; width: 100%; transition: border-color 0.2s; }
        .search-input::placeholder { color: #484f58; }
        .tag-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #e6edf3; padding: 0.75rem 0.75rem; font-size: 0.95rem; width: 90px; transition: border-color 0.2s; }
        .region-select { background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #e6edf3; padding: 0.75rem 0.5rem; font-size: 0.9rem; cursor: pointer; }
        .analyze-btn { background: #c8a84b; border: none; border-radius: 4px; color: #0d1117; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.75rem 2rem; cursor: pointer; transition: background 0.2s, transform 0.1s; white-space: nowrap; }
        .analyze-btn:hover { background: #e0bc5a; }
        .analyze-btn:active { transform: scale(0.98); }
        .analyze-btn:disabled { background: #2d333b; color: #484f58; cursor: not-allowed; }
        .stat-card { background: #161b22; border: 1px solid #21262d; border-radius: 6px; padding: 1.25rem; }
        .champ-pill { background: #161b22; border: 1px solid #21262d; border-radius: 4px; padding: 0.5rem 0.9rem; font-size: 0.82rem; }
        .report-text { font-size: 0.92rem; line-height: 1.85; color: #c9d1d9; }
        .report-text strong, .report-text b { color: #e6edf3; font-weight: 600; }
        .unlock-btn { background: #c8a84b; border: none; border-radius: 4px; color: #0d1117; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.05rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.85rem 2.5rem; cursor: pointer; transition: background 0.2s; }
        .unlock-btn:hover { background: #e0bc5a; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(13,17,23,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid #21262d" : "1px solid transparent",
        padding: "0 2rem", height: 60, display: "flex", alignItems: "center", gap: "2rem",
        backdropFilter: scrolled ? "blur(12px)" : "none", transition: "all 0.3s"
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "0.05em", color: "#e6edf3" }}>
          RANK<span style={{ color: "#c8a84b" }}>LAB</span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginLeft: "1rem" }}>
          <span className="nav-link">Analysis</span>
          <span className="nav-link">How It Works</span>
        </div>
        <div style={{ marginLeft: "auto", background: "#c8a84b", borderRadius: 4, padding: "0.35rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: "#0d1117", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>
          Challenger Level
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: 60 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0d1117 0%, #111827 40%, #0d1117 100%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, #c8a84b 40px, #c8a84b 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #c8a84b 40px, #c8a84b 41px)" }} />
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, background: "radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", textAlign: "center", padding: "3rem 1.5rem", maxWidth: 800, width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: 3, padding: "0.3rem 0.9rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a84b" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#c8a84b", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Challenger-Level Coaching</span>
          </div>

          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "1rem", textTransform: "uppercase" }}>
            Your Stats.<br />
            <span style={{ color: "#c8a84b" }}>Your Mistakes.</span><br />
            Your Climb.
          </h1>

          <p style={{ color: "#8b949e", fontSize: "1rem", maxWidth: 500, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Get a personalized coaching breakdown based on your actual match data — the same way Challenger players analyze their games.
          </p>

          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select className="region-select" value={region} onChange={e => setRegion(e.target.value)}>
              {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <input className="search-input" style={{ flex: 1, minWidth: 160 }} type="text" placeholder="Summoner name" value={summonerName} onChange={e => setSummonerName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            <input className="tag-input" type="text" placeholder="Tag" value={tagline} onChange={e => setTagline(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            <button className="analyze-btn" onClick={handleSubmit} disabled={loading || !summonerName.trim()}>
              {loading ? "Analyzing..." : "Analyze →"}
            </button>
          </div>

          {error && (
            <div style={{ maxWidth: 600, margin: "1rem auto 0", background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", borderRadius: 4, padding: "0.75rem 1rem", color: "#f85149", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {playerData && (
        <div className="fade-in" style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1, height: 1, background: "#21262d" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#484f58", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>Analysis Results</span>
            <div style={{ flex: 1, height: 1, background: "#21262d" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "0.02em", textTransform: "uppercase" }}>{playerData.name}</div>
              <div style={{ fontSize: "0.8rem", color: "#484f58", marginTop: "0.1rem" }}>#{playerData.tagline} · {playerData.region?.toUpperCase()}</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: "0.65rem", color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem", fontWeight: 600 }}>Rank</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: rankColor }}>{playerData.tier} {playerData.rank}</div>
              <div style={{ fontSize: "0.75rem", color: "#484f58" }}>{playerData.lp} LP</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: "0.65rem", color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem", fontWeight: 600 }}>Win Rate</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: parseFloat(playerData.winRate) >= 50 ? "#3fb950" : "#f85149" }}>{playerData.winRate}%</div>
              <div style={{ fontSize: "0.75rem", color: "#484f58" }}>{playerData.wins}W {playerData.losses}L</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: "0.65rem", color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem", fontWeight: 600 }}>Recent</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>{playerData.recentWins}W {playerData.recentLosses}L</div>
              <div style={{ fontSize: "0.75rem", color: "#484f58" }}>KDA {playerData.avgKda}</div>
            </div>
          </div>

          {playerData.topChampions?.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Recent Champions</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {playerData.topChampions.map((champ, i) => (
                  <div key={i} className="champ-pill">
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#e6edf3" }}>{champ.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#484f58", marginTop: "0.1rem" }}>{champ.games}g · {champ.winRate}% WR</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8a84b" }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Coaching Breakdown</span>
              </div>
              {!paid && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#c8a84b", background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.2)", borderRadius: 3, padding: "0.2rem 0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Preview</span>}
            </div>

            <div style={{ padding: "1.5rem 1.25rem" }}>
              <div className="report-text" dangerouslySetInnerHTML={{ __html: formatReport(report?.preview) }} />

              {!paid && (
                <>
                  <div style={{ marginTop: "1.5rem", position: "relative" }}>
                    <div style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
                      <div className="report-text" style={{ opacity: 0.5 }}>Your three biggest mistakes this split are holding you back from your peak elo. Here is exactly what needs to change before your next session...</div>
                    </div>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 0%, #161b22 65%)" }} />
                  </div>
                  <div style={{ textAlign: "center", paddingTop: "1.5rem", borderTop: "1px solid #21262d", marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#8b949e", marginBottom: "1.25rem", lineHeight: 1.6 }}>Unlock your full breakdown — champion pool verdict, your top 3 mistakes, and one drill to run this week.</div>
                    <button className="unlock-btn">Unlock Full Report — $4.99</button>
                    <div style={{ fontSize: "0.7rem", color: "#484f58", marginTop: "0.75rem" }}>One-time · Instant access</div>
                  </div>
                </>
              )}

              {paid && (
                <div style={{ marginTop: "1rem" }}>
                  <div className="report-text" dangerouslySetInnerHTML={{ __html: formatReport(report?.fullReport) }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!playerData && !loading && (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 1.5rem 5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ flex: 1, height: 1, background: "#21262d" }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#484f58", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>How It Works</span>
            <div style={{ flex: 1, height: 1, background: "#21262d" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "#21262d", borderRadius: 6, overflow: "hidden" }}>
            {[
              { num: "01", title: "Enter Your Name", desc: "We pull your recent ranked games directly from Riot's servers — no login required." },
              { num: "02", title: "Deep Analysis", desc: "Your stats get reviewed against Challenger-level benchmarks. KDA, CS, vision, kill participation — nothing gets missed." },
              { num: "03", title: "Your Breakdown", desc: "You get a specific, honest breakdown of what's holding you back and exactly how to fix it." },
            ].map((item, i) => (
              <div key={i} style={{ background: "#161b22", padding: "2rem 1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "#21262d", lineHeight: 1, marginBottom: "1rem" }}>{item.num}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem", color: "#e6edf3" }}>{item.title}</div>
                <div style={{ fontSize: "0.85rem", color: "#8b949e", lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ borderTop: "1px solid #21262d", padding: "1.5rem 2rem", textAlign: "center", fontSize: "0.75rem", color: "#21262d" }}>
        RankLab is not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.
      </footer>
    </div>
  );
}

function formatReport(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}
