import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function Profile({ searchParams }) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const supabase = supabaseAdmin();

  const { data: runner, error: runnerError } = await supabase
    .from("runners")
    .select("id, name, avatar_url, whatsapp, address")
    .eq("id", runnerId)
    .single();
  if (runnerError || !runner) {
    redirect("/");
  }

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("distance_m, elevation_gain_m, moving_time_s")
    .eq("runner_id", runnerId);
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
  const isEditing = searchParams?.edit === "1";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 44px 24px 32px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-avatar-lg { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2px solid #FF5A1F; margin-bottom: 18px; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0; letter-spacing: -0.01em; }
        .mtc-body { max-width: 440px; margin: 0 auto; padding: 0 20px; }
        .mtc-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 28px; }
        .mtc-stat-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 16px; text-align: center; }
        .mtc-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; color: #FF5A1F; }
        .mtc-stat-label { font-size: 12px; color: #8A8A85; margin-top: 4px; letter-spacing: 0.04em; text-transform: uppercase; }
        .mtc-details-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; margin-top: 16px; text-align: left; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px; }
        .mtc-detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #201F1C; font-size: 14px; }
        .mtc-detail-row:last-of-type { border-bottom: none; }
        .mtc-detail-label { color: #8A8A85; }
        .mtc-detail-value { color: #F5F1EA; font-weight: 500; text-align: right; }
        .mtc-detail-value.empty { color: #5A5854; font-style: italic; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; }
        .mtc-btn-ghost { display: inline-block; margin-left: 14px; color: #8A8A85; text-decoration: none; font-size: 14px; }
        .mtc-btn-ghost:hover { color: #F5F1EA; }
        .mtc-links { text-align: center; margin-top: 28px; }
        .mtc-links a { display: block; color: #8A8A85; text-decoration: none; font-size: 14px; margin-bottom: 12px; }
        .mtc-links a:hover { color: #F5F1EA; }
        .mtc-links a.primary { color: #FF5A1F; font-weight: 600; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
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

          {isEditing ? (
            <form action="/api/profile/update" method="POST" className="mtc-details-card">
              <p className="mtc-details-title">My Details</p>
              <label className="mtc-field-label">WhatsApp</label>
              <input type="text" name="whatsapp" defaultValue={runner.whatsapp || ""} placeholder="e.g. 0123456789" className="mtc-field-input" />
              <label className="mtc-field-label">Address</label>
              <input type="text" name="address" defaultValue={runner.address || ""} placeholder="e.g. your delivery address" className="mtc-field-input" />
              <button type="submit" className="mtc-btn-primary">Save</button>
              <a href="/profile" className="mtc-btn-ghost">Cancel</a>
            </form>
          ) : (
            <div className="mtc-details-card">
              <p className="mtc-details-title">My Details</p>
              <div className="mtc-detail-row">
                <span className="mtc-detail-label">WhatsApp</span>
                <span className={`mtc-detail-value ${!runner.whatsapp ? "empty" : ""}`}>{runner.whatsapp || "Not set"}</span>
              </div>
              <div className="mtc-detail-row">
                <span className="mtc-detail-label">Address</span>
                <span className={`mtc-detail-value ${!runner.address ? "empty" : ""}`}>{runner.address || "Not set"}</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <a href="/profile?edit=1" className="mtc-btn-primary">Edit</a>
              </div>
            </div>
          )}

          <div className="mtc-links">
            <a href="/leaderboard" className="primary">View this month's leaderboard &rarr;</a>
            <a href="/api/auth/logout">Log out</a>
          </div>
        </div>
      </div>
    </>
  );
}
