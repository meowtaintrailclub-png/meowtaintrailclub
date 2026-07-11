import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";

export const dynamic = "force-dynamic";

function monthKey(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function monthBounds(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const end = new Date(Date.UTC(year, month, 1)).toISOString();
  return { start, end };
}

async function getAvailableMonths() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("activities").select("started_at");
  if (error) throw error;
  const months = new Set();
  for (const a of data ?? []) {
    months.add(monthKey(a.started_at));
  }
  return Array.from(months);
}

async function getLeaderboard(monthStr) {
  const supabase = supabaseAdmin();
  const { start, end } = monthBounds(monthStr);

  const { data: runners, error: runnersError } = await supabase
    .from("runners")
    .select("id, name, avatar_url");
  if (runnersError) throw runnersError;

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("runner_id, distance_m, elevation_gain_m, moving_time_s, started_at")
    .gte("started_at", start)
    .lt("started_at", end);
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

function rankBadgeStyle(i) {
  if (i === 0) return { background: "#FF5A1F", border: "1px solid #FF5A1F", color: "#0D0D0D" };
  if (i < 3) return { background: "transparent", border: "1px solid #FF5A1F", color: "#FF5A1F" };
  return { background: "transparent", border: "1px solid #2A2A2A", color: "#8A8A85" };
}

export default async function Leaderboard({ searchParams }) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const currentMonth = monthKey(new Date());
  const availableMonths = await getAvailableMonths();
  const monthsToShow = Array.from(new Set([currentMonth, ...availableMonths])).sort().reverse();

  const requestedMonth = searchParams?.month;
  const selectedMonth =
    requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentMonth;

  const rows = await getLeaderboard(selectedMonth);
  const maxDistance = rows.length ? Math.max(...rows.map((r) => r.total_distance_m)) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 40px 24px 20px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-logo { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 1px solid #2A2A2A; margin-bottom: 16px; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 22px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 34px; margin: 0 0 20px; letter-spacing: -0.01em; }
        .mtc-month-nav { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; justify-content: center; flex-wrap: wrap; }
        .mtc-month-pill { flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 7px 14px; border-radius: 20px; border: 1px solid #2A2A2A; color: #8A8A85; text-decoration: none; }
        .mtc-month-pill:hover { border-color: #3A3733; color: #F5F1EA; }
        .mtc-month-pill.active { background: #FF5A1F; border-color: #FF5A1F; color: #0D0D0D; font-weight: 600; }
        .mtc-list { max-width: 620px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 16px 18px; margin-bottom: 10px; display: flex; align-items: center; gap: 14px; transition: border-color 0.15s ease; }
        .mtc-card:hover { border-color: #3A3733; }
        .mtc-rank { flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 14px; }
        .mtc-avatar { flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid #2A2A2A; }
        .mtc-name { font-weight: 600; font-size: 15px; margin: 0 0 6px; color: #F5F1EA; }
        .mtc-bar-track { height: 3px; background: #201F1C; border-radius: 2px; overflow: hidden; width: 100%; }
        .mtc-bar-fill { height: 100%; background: #FF5A1F; border-radius: 2px; }
        .mtc-stats { flex-shrink: 0; text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8A8A85; line-height: 1.5; }
        .mtc-stats .primary { font-size: 16px; font-weight: 600; color: #FF5A1F; }
        .mtc-empty { max-width: 440px; margin: 28px auto 0; padding: 48px 24px; background: #141311; border: 1px solid #201F1C; border-radius: 10px; text-align: center; }
        .mtc-empty img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #2A2A2A; }
        .mtc-empty p.title { color: #F5F1EA; font-weight: 600; margin: 16px 0 6px; }
        .mtc-empty p.sub { color: #8A8A85; margin: 0; font-size: 14px; }
        .mtc-footer { max-width: 620px; margin: 26px auto 0; padding: 0 20px; text-align: center; }
        .mtc-footer a { color: #8A8A85; text-decoration: none; font-size: 13px; }
        .mtc-footer a:hover { color: #F5F1EA; }
        @media (max-width: 480px) {
          .mtc-title { font-size: 28px; }
          .mtc-stats { font-size: 11px; }
          .mtc-stats .primary { font-size: 14px; }
          .mtc-card { gap: 10px; padding: 13px; }
        }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/profile" className="mtc-back">&larr; Back to my profile</a>
          <img src="/Meowtain-logo.jpeg" alt="Meowtain Trail Club" className="mtc-logo" />
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">{monthLabel(selectedMonth)}</h1>

          <div className="mtc-month-nav">
            {monthsToShow.map((m) => (
              
                key={m}
                href={`/leaderboard?month=${m}`}
                className={`mtc-month-pill ${m === selectedMonth ? "active" : ""}`}
              >
                {monthLabel(m)}
              </a>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mtc-empty">
            <img src="/Meowtain-logo.jpeg" alt="Meowtain Trail Club" />
            <p className="title">No one logged a run in {monthLabel(selectedMonth)}.</p>
            <p className="sub">Be the first name on this month's board.</p>
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
}
