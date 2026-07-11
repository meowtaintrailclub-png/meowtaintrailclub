import { supabaseAdmin } from "../lib/supabase";

export const dynamic = "force-dynamic";

function monthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  return { start, end };
}

function formatNumber(n) {
  return Math.round(n).toLocaleString("en-US");
}

async function getClubStats() {
  const supabase = supabaseAdmin();

  const { count: totalRunners } = await supabase
    .from("runners")
    .select("*", { count: "exact", head: true });

  const { start, end } = monthBounds();
  const { data: activities } = await supabase
    .from("activities")
    .select("distance_m, elevation_gain_m")
    .gte("started_at", start)
    .lt("started_at", end);

  const totals = (activities || []).reduce(
    (acc, a) => {
      acc.distance += Number(a.distance_m) || 0;
      acc.elevation += Number(a.elevation_gain_m) || 0;
      return acc;
    },
    { distance: 0, elevation: 0 }
  );

  return { totalRunners: totalRunners || 0, ...totals };
}

async function getSponsors() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return [];
  return data || [];
}

export default async function Home() {
  const stats = await getClubStats();
  const sponsors = await getSponsors();
  const hasActivity = stats.elevation > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        .mtc-home { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; }
        .mtc-hero { position: relative; overflow: hidden; padding: 70px 24px 56px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.22; }
        .mtc-hero-inner { position: relative; z-index: 1; max-width: 460px; margin: 0 auto; }
        .mtc-logo { width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 1px solid #2A2A2A; margin-bottom: 22px; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 14px; }
        .mtc-headline { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 42px; line-height: 1.08; margin: 0 0 16px; letter-spacing: -0.01em; }
        .mtc-sub { color: #9C9A94; font-size: 15px; line-height: 1.6; margin: 0 0 30px; }
        .mtc-cta { display: inline-flex; align-items: center; gap: 10px; padding: 14px 30px; background: #FF5A1F; color: #0D0D0D; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; transition: opacity 0.15s ease; }
        .mtc-cta:hover { opacity: 0.88; }
        .mtc-secondary-link { display: block; margin-top: 16px; color: #8A8A85; text-decoration: none; font-size: 13px; }
        .mtc-secondary-link:hover { color: #F5F1EA; }
        .mtc-stats-strip { border-bottom: 1px solid #201F1C; padding: 22px 24px; }
        .mtc-stats-inner { max-width: 640px; margin: 0 auto; display: flex; justify-content: center; gap: 36px; flex-wrap: wrap; }
        .mtc-stat { text-align: center; }
        .mtc-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; color: #FF5A1F; }
        .mtc-stat-label { font-size: 11px; color: #8A8A85; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
        .mtc-stats-fallback { text-align: center; color: #8A8A85; font-size: 14px; max-width: 480px; margin: 0 auto; }
        .mtc-how { max-width: 800px; margin: 0 auto; padding: 56px 24px; }
        .mtc-how-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; text-align: center; margin: 0 0 40px; }
        .mtc-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .mtc-step { text-align: center; }
        .mtc-step-icon { width: 44px; height: 44px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; border: 1px solid #2A2A2A; border-radius: 50%; }
        .mtc-step-title { font-weight: 600; font-size: 15px; margin: 0 0 6px; }
        .mtc-step-desc { color: #8A8A85; font-size: 13px; line-height: 1.5; margin: 0; }
        .mtc-sponsors { max-width: 800px; margin: 0 auto; padding: 0 24px 56px; text-align: center; }
        .mtc-sponsors-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #5A5854; margin: 0 0 20px; }
        .mtc-sponsors-row { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .mtc-sponsor-chip { display: inline-flex; align-items: center; justify-content: center; background: #F5F1EA; border-radius: 10px; padding: 12px 20px; }
        .mtc-sponsor-chip img { height: 32px; max-width: 140px; object-fit: contain; display: block; }
        .mtc-footer { text-align: center; padding: 30px 24px 50px; color: #5A5854; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
        @media (max-width: 700px) and (min-width: 521px) {
          .mtc-steps { grid-template-columns: repeat(2, 1fr); row-gap: 32px; }
        }
        @media (max-width: 520px) {
          .mtc-headline { font-size: 32px; }
          .mtc-steps { grid-template-columns: 1fr; gap: 32px; }
          .mtc-stats-inner { gap: 24px; }
        }
      `}</style>

      <main className="mtc-home">
        <div className="mtc-hero">
          <svg className="mtc-hero-bg" viewBox="0 0 800 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="0,260 90,150 160,220 250,90 340,210 430,60 520,200 610,120 700,230 800,140 800,300 0,300" fill="none" stroke="#FF5A1F" strokeWidth="2" />
            <polyline points="0,280 120,200 220,250 320,160 420,240 540,170 650,250 800,190" fill="none" stroke="#3A3733" strokeWidth="1.5" />
          </svg>

          <div className="mtc-hero-inner">
            <img src="/Meowtain-logo.jpeg" alt="Meowtain Trail Club" className="mtc-logo" />
            <p className="mtc-eyebrow">Meowtain Trail Club</p>
            <h1 className="mtc-headline">Chase The Summit</h1>
            <p className="mtc-sub">
              Connect your Strava, log every trail run, and climb this month's leaderboard — together with the whole club.
            </p>
            <a href="/api/auth/strava" className="mtc-cta">Connect with Strava</a>
            <a href="/public" className="mtc-secondary-link">View leaderboard without logging in &rarr;</a>
          </div>
        </div>

        <div className="mtc-stats-strip">
          {hasActivity ? (
            <div className="mtc-stats-inner">
              <div className="mtc-stat">
                <div className="mtc-stat-value">{stats.totalRunners}</div>
                <div className="mtc-stat-label">Runners</div>
              </div>
              <div className="mtc-stat">
                <div className="mtc-stat-value">{formatNumber(stats.elevation)}m</div>
                <div className="mtc-stat-label">Climbed this month</div>
              </div>
              <div className="mtc-stat">
                <div className="mtc-stat-value">{(stats.distance / 1000).toFixed(0)}km</div>
                <div className="mtc-stat-label">Covered this month</div>
              </div>
            </div>
          ) : (
            <p className="mtc-stats-fallback">
              {stats.totalRunners > 0
                ? `${stats.totalRunners} runners have joined so far — be the first to log a climb this month.`
                : "Be the first runner to join the club."}
            </p>
          )}
        </div>

        <div className="mtc-how">
          <h2 className="mtc-how-title">How it works</h2>
          <div className="mtc-steps">
            <div className="mtc-step">
              <div className="mtc-step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="1.6">
                  <path d="M9 12h6M12 9v6" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <p className="mtc-step-title">Connect</p>
              <p className="mtc-step-desc">Link your Strava account in one click. Free, and takes seconds.</p>
            </div>
            <div className="mtc-step">
              <div className="mtc-step-icon">
                <svg width="20" height="20" viewBox="0 0 25 22" fill="#FF5A1F">
                  <circle cx="6" cy="9" r="2.1" />
                  <circle cx="10.7" cy="5.6" r="2.3" />
                  <circle cx="15.3" cy="5.6" r="2.3" />
                  <circle cx="20" cy="9" r="2.1" />
                  <ellipse cx="13" cy="16" rx="6.3" ry="5.2" />
                </svg>
              </div>
              <p className="mtc-step-title">Run</p>
              <p className="mtc-step-desc">Every trail run syncs automatically — distance, elevation, and time.</p>
            </div>
            <div className="mtc-step">
              <div className="mtc-step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="1.6">
                  <path d="M3 20L9 8L12 14L15 9L21 20H3Z" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mtc-step-title">Climb</p>
              <p className="mtc-step-desc">See where you rank on this month's leaderboard, reset every month.</p>
            </div>
            <div className="mtc-step">
              <div className="mtc-step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="1.6">
                  <path d="M7 4h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" strokeLinejoin="round" />
                  <path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" strokeLinecap="round" />
                  <path d="M12 12v3M9 19h6M10 19v-2.5h4V19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mtc-step-title">Earn Rewards</p>
              <p className="mtc-step-desc">Top climbers win prizes when each month's challenge wraps up.</p>
            </div>
          </div>
        </div>

        {sponsors.length > 0 && (
          <div className="mtc-sponsors">
            <p className="mtc-sponsors-label">Our Sponsors</p>
            <div className="mtc-sponsors-row">
              {sponsors.map((s) =>
                s.website_url ? (
                  <a key={s.id} href={s.website_url} target="_blank" rel="noopener noreferrer" className="mtc-sponsor-chip">
                    <img src={`/${s.logo_path}`} alt={s.name} />
                  </a>
                ) : (
                  <div key={s.id} className="mtc-sponsor-chip">
                    <img src={`/${s.logo_path}`} alt={s.name} />
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div className="mtc-footer">MEOWTAIN TRAIL CLUB</div>
      </main>
    </>
  );
}
