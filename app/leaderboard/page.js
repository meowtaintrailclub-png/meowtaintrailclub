import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";

export const dynamic = "force-dynamic";

async function getLeaderboard() {
  const supabase = supabaseAdmin();

  const { data: runners, error: runnersError } = await supabase
    .from("runners")
    .select("id, name, avatar_url");
  if (runnersError) throw runnersError;

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("runner_id, distance_m, elevation_gain_m, moving_time_s");
  if (activitiesError) throw activitiesError;

  const totals = {};
  for (const runner of runners) {
    totals[runner.id] = {
      runner_id: runner.id,
      name: runner.name,
      avatar_url: runner.avatar_url,
      total_distance_m: 0,
      total_elevation_m: 0,
      total_moving_time_s: 0,
      activity_count: 0,
    };
  }
  for (const activity of activities) {
    const t = totals[activity.runner_id];
    if (!t) continue;
    t.total_distance_m += Number(activity.distance_m) || 0;
    t.total_elevation_m += Number(activity.elevation_gain_m) || 0;
    t.total_moving_time_s += Number(activity.moving_time_s) || 0;
    t.activity_count += 1;
  }

  return Object.values(totals)
    .filter((r) => r.activity_count > 0)
    .sort((a, b) => b.total_elevation_m - a.total_elevation_m);
}

function formatTime(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function MountainMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M2 24L11 9L16 17L20 11L30 24H2Z" stroke="#FF5A1F" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="11" cy="6" r="1.6" fill="#FF5A1F" />
    </svg>
  );
}

function rankBadgeStyle(i) {
  if (i === 0) return { background: "#FF5A1F", border: "1px solid #FF5A1F", color: "#0D0D0D" };
  if (i < 3) return { background: "transparent", border: "1px solid #FF5A1F", color: "#FF5A1F" };
  return { background: "transparent", border: "1px solid #2A2A2A", color: "#8A8A85" };
}

export default async function Leaderboard() {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const rows = await getLeaderboard();
  const maxDistance = rows.length ? Math.max(...rows.map((r) => r.total_distance_m)) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 40px 24px 34px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-mark { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 18px; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 22px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 38px; margin: 0; letter-spacing: -0.01em; }
        .mtc-list { max-width: 620px; margin: 36px auto 0; padding: 0 20px; }
        .mtc-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 16px 18px; margin-bottom: 10px; display: flex; align-items: center; gap: 14px; transition: border-color 0.15s ease; }
        .mtc-card:hover { border-color: #3A3733; }
        .mtc-rank { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 14px; }
        .mtc-avatar { flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid #2A2A2A; }
        .mtc-name { font-weight: 600; font-size: 15px; margin: 0 0 6px; color: #F5F1EA; }
        .mtc-bar-track { height: 3px; background: #201F1C; border-radius: 2px; overflow: hidden; width: 100%; }
        .mtc-bar-fill { height: 100%; background: #FF5A1F; border-radius: 2px; }
        .mtc-stats { flex-shrink: 0; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8A8A85; line-height: 1.5; }
        .mtc-stats .primary { font-size: 16px; font-weight: 600; color: #FF5A1F; }
        .mtc-empty { max-width: 440px; margin: 36px auto 0; padding: 48px 24px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; text-align: center; }
        .mtc-empty p.title { color: #F5F1EA; font-weight: 600; margin: 16px 0 6px; }
        .mtc-empty p.sub { color: #8A8A85; margin: 0; font-size: 14px; }
        .mtc-footer { max-width: 620px; margin: 26px auto 0; padding: 0 20px; text-align: center; }
        .mtc-footer a { color: #8A8A85; text-decoration: none; font-size: 13px; }
        .mtc-footer a:hover { color: #F5F1EA; }
        @media (max-width: 480px) {
          .mtc-title { font-size: 30px; }
          .mtc-stats { font-size: 11px; }
          .mtc-stats .primary { font-size: 14px; }
          .mtc-card { gap: 10px; padding: 13px; }
        }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/profile" className="mtc-back">&larr; Back to my profile</a>
          <div className="mtc-mark">
            <MountainMark />
          </div>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Leaderboard</h1>
        </div>

        {rows.length === 0 ? (
          <div className="mtc-empty">
            <MountainMark size={28} />
            <p className="title">No one's logged a run yet.</p>
            <p className="sub">Be the first name on the board.</p>
          </div>
        ) : (
          <div className="mtc-list">
            {rows.map((r, i) => {
              const barWidth = maxDistance ? Math.max(4, (r.total_distance_m / maxDistance) * 100) : 0;
              return (
                <div className="mtc-card" key={r.runner_id}>
                  <div className="mtc-rank" style={rankBadgeStyle(i)}>{i + 1}</div>

                  {r.avatar_url && <img className="mtc-avatar" src={r.avatar_url} alt={r.name} />}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="mtc-name">{r.name}</p>
                    <div className="mtc-bar-track">
                      <div className="mtc-bar-fill" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>

                  <div className="mtc-stats">
                    <div className="primary">{Math.round(r.total_elevation_m)} m</div>
                    <div>{(r.total_distance_m / 1000).toFixed(1)} km &middot; {formatTime(r.total_moving_time_s)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mtc-footer">
          <a href="/profile">&larr; Back to my profile</a>
        </div>
      </div>
    </>
  );
}    t.total_moving_time_s += Number(activity.moving_time_s) || 0;
    t.activity_count += 1;
  }

  return Object.values(totals)
    .filter((r) => r.activity_count > 0)
    .sort((a, b) => b.total_elevation_m - a.total_elevation_m);
}

function formatTime(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function PawIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 25 22" fill={color}>
      <circle cx="6" cy="9" r="2.1" />
      <circle cx="10.7" cy="5.6" r="2.3" />
      <circle cx="15.3" cy="5.6" r="2.3" />
      <circle cx="20" cy="9" r="2.1" />
      <ellipse cx="13" cy="16" rx="6.3" ry="5.2" />
    </svg>
  );
}

const RANK_STYLES = [
  { bg: "#E8B04B", fg: "#1F2620" },
  { bg: "#C9C2B4", fg: "#1F2620" },
  { bg: "#A65E2E", fg: "#F6F2E9" },
];

export default async function Leaderboard() {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const rows = await getLeaderboard();
  const maxDistance = rows.length ? Math.max(...rows.map((r) => r.total_distance_m)) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #EDE8DD; color: #1F2620; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { position: relative; overflow: hidden; background: #1F2620; color: #EDE8DD; padding: 36px 24px 46px; text-align: center; }
        .mtc-hero svg.contours { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.18; }
        .mtc-back { position: relative; z-index: 1; display: inline-block; color: #C9C2B4; font-size: 14px; text-decoration: none; margin-bottom: 14px; }
        .mtc-eyebrow { position: relative; z-index: 1; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #E8B04B; margin: 0 0 6px; }
        .mtc-title { position: relative; z-index: 1; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 44px; letter-spacing: 0.01em; margin: 0; text-transform: uppercase; }
        .mtc-list { max-width: 640px; margin: -22px auto 0; padding: 0 20px; position: relative; z-index: 1; }
        .mtc-card { background: #FFFFFF; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; box-shadow: 0 1px 3px rgba(31,38,32,0.08); }
        .mtc-rank { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #EDE8DD; color: #5C7A5C; font-family: 'IBM Plex Mono', monospace; font-weight: 600; position: relative; }
        .mtc-rank .paw { position: absolute; bottom: -4px; right: -4px; background: inherit; }
        .mtc-avatar { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #EDE8DD; }
        .mtc-name { font-weight: 600; font-size: 15px; margin: 0 0 4px; }
        .mtc-bar-track { height: 5px; background: #EDE8DD; border-radius: 3px; overflow: hidden; width: 100%; }
        .mtc-bar-fill { height: 100%; background: #5C7A5C; border-radius: 3px; }
        .mtc-stats { flex-shrink: 0; text-align: right; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #1F2620; line-height: 1.5; }
        .mtc-stats .primary { font-size: 15px; font-weight: 600; color: #A65E2E; }
        .mtc-empty { max-width: 480px; margin: -22px auto 0; padding: 40px 24px; background: #FFFFFF; border-radius: 12px; text-align: center; position: relative; z-index: 1; }
        .mtc-footer { max-width: 640px; margin: 28px auto 0; padding: 0 20px; text-align: center; }
        .mtc-footer a { color: #5C7A5C; text-decoration: none; font-size: 14px; font-weight: 500; }
        @media (max-width: 480px) {
          .mtc-title { font-size: 34px; }
          .mtc-stats { font-size: 11px; }
          .mtc-stats .primary { font-size: 13px; }
          .mtc-card { gap: 10px; padding: 14px; }
        }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <svg className="contours" viewBox="0 0 600 200" preserveAspectRatio="none">
            <path d="M0,150 Q100,100 200,140 T400,120 T600,150" fill="none" stroke="#E8B04B" strokeWidth="2" />
            <path d="M0,170 Q100,125 200,160 T400,145 T600,170" fill="none" stroke="#EDE8DD" strokeWidth="1.5" />
            <path d="M0,120 Q100,70 200,110 T400,90 T600,115" fill="none" stroke="#5C7A5C" strokeWidth="1.5" />
          </svg>
          <a href="/profile" className="mtc-back">&larr; Back to my profile</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">This Month's Leaderboard</h1>
        </div>

        {rows.length === 0 ? (
          <div className="mtc-empty">
            <PawIcon size={32} color="#A65E2E" />
            <p style={{ marginTop: 12, fontWeight: 600 }}>No one's logged a run yet.</p>
            <p style={{ color: "#5C7A5C" }}>Be the first to leave a paw print on the trail.</p>
          </div>
        ) : (
          <div className="mtc-list">
            {rows.map((r, i) => {
              const rankStyle = RANK_STYLES[i];
              const barWidth = maxDistance ? Math.max(4, (r.total_distance_m / maxDistance) * 100) : 0;
              return (
                <div className="mtc-card" key={r.runner_id}>
                  <div className="mtc-rank" style={rankStyle ? { background: rankStyle.bg, color: rankStyle.fg } : undefined}>
                    {i + 1}
                    {i < 3 && (
                      <span className="paw">
                        <PawIcon size={14} color={rankStyle.bg} />
                      </span>
                    )}
                  </div>

                  {r.avatar_url && <img className="mtc-avatar" src={r.avatar_url} alt={r.name} />}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="mtc-name">{r.name}</p>
                    <div className="mtc-bar-track">
                      <div className="mtc-bar-fill" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>

                  <div className="mtc-stats">
                    <div className="primary">{Math.round(r.total_elevation_m)} m</div>
                    <div>{(r.total_distance_m / 1000).toFixed(1)} km &middot; {formatTime(r.total_moving_time_s)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mtc-footer">
          <a href="/profile">&larr; Back to my profile</a>
        </div>
      </div>
    </>
  );
}
