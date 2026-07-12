import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { getLoggedInRunnerId } from "../../../lib/session";

export const dynamic = "force-dynamic";

export default async function RunnerProfile({ params }) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const supabase = supabaseAdmin();

  const { data: runner, error: runnerError } = await supabase
    .from("runners")
    .select("id, name, avatar_url")
    .eq("id", params.id)
    .single();

  if (runnerError || !runner) {
    notFound();
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("distance_m, elevation_gain_m, moving_time_s")
    .eq("runner_id", params.id);
  if (activitiesError) throw activitiesError;

  const totals = (activities || []).reduce(
    (acc, a) => {
      acc.distance += Number(a.distance_m) || 0;
      acc.elevation += Number(a.elevation_gain_m) || 0;
      acc.time += Number(a.moving_time_s) || 0;
      acc.count += 1;
      return acc;
    },
    { distance: 0, elevation: 0, time: 0, count: 0 }
  );

  const hours = Math.floor(totals.time / 3600);
  const minutes = Math.round((totals.time % 3600) / 60);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 44px 24px 32px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 22px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-avatar-lg { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid #FF5A1F; margin-bottom: 18px; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0; letter-spacing: -0.01em; }
        .mtc-body { max-width: 440px; margin: 0 auto; padding: 0 20px; }
        .mtc-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 28px; }
        .mtc-stat-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 16px; text-align: center; }
        .mtc-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; color: #FF5A1F; }
        .mtc-stat-label { font-size: 12px; color: #8A8A85; margin-top: 4px; letter-spacing: 0.04em; text-transform: uppercase; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/leaderboard" className="mtc-back">&larr; Back to leaderboard</a>
          {runner.avatar_url && <img src={runner.avatar_url} alt={runner.name} className="mtc-avatar-lg" />}
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-name">{runner.name}</h1>
        </div>

        <div className="mtc-body">
          <div className="mtc-stats-grid">
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{Math.round(totals.elevation)}</div>
              <div className="mtc-stat-label">Elevation (m)</div>
            </div>
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{(totals.distance / 1000).toFixed(1)}</div>
              <div className="mtc-stat-label">Distance (km)</div>
            </div>
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{hours}h {minutes}m</div>
              <div className="mtc-stat-label">Time</div>
            </div>
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{totals.count}</div>
              <div className="mtc-stat-label">Activities</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
