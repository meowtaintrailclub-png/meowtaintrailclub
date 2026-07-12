export const metadata = {
  title: "About & Club Rules · Meowtain Trail Club",
  description: "How Meowtain Trail Club's monthly challenge works, and the rules of the road.",
};

export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-about { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding: 50px 24px 60px; }
        .mtc-about-inner { max-width: 640px; margin: 0 auto; }
        .mtc-about-back { display: inline-block; color: #8A8A85; text-decoration: none; font-size: 13px; margin-bottom: 24px; }
        .mtc-about-back:hover { color: #F5F1EA; }
        .mtc-about-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-about-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0 0 8px; }
        .mtc-about-lede { color: #B8B4AC; font-size: 15px; line-height: 1.6; margin: 0 0 36px; }
        .mtc-section { margin-bottom: 34px; }
        .mtc-section h2 { font-family: 'Space Grotesk', sans-serif; font-size: 19px; margin: 0 0 12px; }
        .mtc-section p { color: #B8B4AC; font-size: 14px; line-height: 1.7; margin: 0 0 10px; }
        .mtc-section ul { color: #B8B4AC; font-size: 14px; line-height: 1.8; margin: 0 0 10px; padding-left: 20px; }
        .mtc-section li { margin-bottom: 4px; }
        .mtc-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 18px 20px; margin-bottom: 12px; }
        .mtc-card-title { font-weight: 600; font-size: 14px; color: #FF5A1F; margin: 0 0 4px; }
        .mtc-card p { margin: 0; }
        .mtc-todo { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #0D0D0D; background: #FF5A1F; border-radius: 4px; padding: 2px 8px; margin-left: 8px; vertical-align: middle; }
        .mtc-about a.inline { color: #FF5A1F; text-decoration: none; }
        .mtc-about a.inline:hover { text-decoration: underline; }
      `}</style>

      <main className="mtc-about">
        <div className="mtc-about-inner">
          <a href="/" className="mtc-about-back">&larr; Back home</a>
          <p className="mtc-about-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-about-title">About &amp; Club Rules</h1>
          <p className="mtc-about-lede">
            Everything you need to know about how the monthly challenge works, what counts,
            and how rankings are decided.
          </p>

          <div className="mtc-section">
            <h2>About the club</h2>
            <p>
              Meowtain Trail Club is a community of trail runners who track their climbs together
              every month. Instead of a single race, we run a rolling monthly challenge — connect
              your Strava, log your runs, and see where you land on the leaderboard alongside
              everyone else in the club.
            </p>
          </div>

          <div className="mtc-section">
            <h2>How the monthly challenge works</h2>
            <div className="mtc-card">
              <p className="mtc-card-title">1. Connect</p>
              <p>Link your Strava account once. It's free and takes seconds.</p>
            </div>
            <div className="mtc-card">
              <p className="mtc-card-title">2. Run</p>
              <p>
                Every trail run you log syncs automatically. Only activity from the day you join
                onward counts — anything logged on Strava before you connected doesn't get pulled in.
              </p>
            </div>
            <div className="mtc-card">
              <p className="mtc-card-title">3. Climb</p>
              <p>
                Rankings are based on total elevation gain for the month, not distance. The
                leaderboard resets on the 1st of every month, and past months stay browsable
                so you can look back anytime.
              </p>
            </div>
            <div className="mtc-card">
              <p className="mtc-card-title">4. Earn Rewards</p>
              <p>
                Top climbers win prizes when each month wraps up.{" "}
                <span className="mtc-todo">Add prize details</span>
              </p>
            </div>
          </div>

          <div className="mtc-section">
            <h2>What counts</h2>
            <ul>
              <li>Only activities logged as <strong>Run</strong> or <strong>Trail Run</strong> on Strava are counted — rides, walks, hikes, and other activity types don't count toward the leaderboard.</li>
              <li>Activity must be logged from your join date onward. Past runs from before you connected won't be pulled in.</li>
              <li>Manual entries and treadmill runs typically don't reflect real elevation gain, so we recommend GPS-tracked outdoor runs for the most accurate ranking.</li>
            </ul>
          </div>

          <div className="mtc-section">
            <h2>Categories</h2>
            <p>
              The leaderboard can be filtered by <strong>Male</strong> and <strong>Female</strong>{" "}
              categories, and by elevation tier — <strong>3000m, 4000m, 5000m, 6000m, and 7000m</strong>{" "}
              brackets — so you can see how you stack up against runners at a similar level.
            </p>
          </div>

          <div className="mtc-section">
            <h2>Fair play</h2>
            <ul>
              <li>Runs should reflect real outdoor effort — no GPS spoofing or manually inflated activities.</li>
              <li>Keep your Strava activity privacy set to at least "Followers" or "Everyone" so your runs sync correctly.</li>
              <li>Admins may review and remove activities that appear inaccurate or in violation of these rules.</li>
            </ul>
          </div>

          <div className="mtc-section">
            <h2>Questions</h2>
            <p>
              Reach out anytime at{" "}
              <a href="mailto:meowtaintrailclub@gmail.com" className="inline">meowtaintrailclub@gmail.com</a>.
              For details on what data we collect and how it's used, see our{" "}
              <a href="/legal" className="inline">Privacy &amp; Disclaimer</a> page.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
