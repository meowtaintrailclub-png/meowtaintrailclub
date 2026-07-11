import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { isAdminLoggedIn } from "../../lib/adminSession";

export const dynamic = "force-dynamic";

function formatDob(dob) {
  if (!dob) return "-";
  const d = new Date(dob);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatJoined(createdAt) {
  const d = new Date(createdAt);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

async function getMembers() {
  const supabase = supabaseAdmin();

  const { data: runners, error: runnersError } = await supabase
    .from("runners")
    .select("id, name, whatsapp, email, address, date_of_birth, created_at")
    .order("created_at", { ascending: false });
  if (runnersError) throw runnersError;

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("runner_id, distance_m, elevation_gain_m, moving_time_s");
  if (activitiesError) throw activitiesError;

  const totalsByRunner = {};
  for (const a of activities) {
    if (!totalsByRunner[a.runner_id]) {
      totalsByRunner[a.runner_id] = { distance: 0, elevation: 0, time: 0, count: 0 };
    }
    const t = totalsByRunner[a.runner_id];
    t.distance += Number(a.distance_m) || 0;
    t.elevation += Number(a.elevation_gain_m) || 0;
    t.time += Number(a.moving_time_s) || 0;
    t.count += 1;
  }

  return runners.map((r) => ({
    ...r,
    stats: totalsByRunner[r.id] || { distance: 0, elevation: 0, time: 0, count: 0 },
  }));
}

export default async function AdminPage() {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const members = await getMembers();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0; }
        .mtc-count { color: #8A8A85; font-size: 13px; margin-top: 6px; }
        .mtc-admin-body { max-width: 1150px; margin: 24px auto 0; padding: 0 20px; }
        .mtc-table-wrap { overflow-x: auto; border: 1px solid #201F1C; border-radius: 10px; }
        .mtc-table { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
        .mtc-table th { text-align: left; padding: 12px 14px; background: #141311; color: #8A8A85; font-weight: 500; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #201F1C; }
        .mtc-table td { padding: 12px 14px; border-bottom: 1px solid #201F1C; color: #F5F1EA; }
        .mtc-table tr:last-child td { border-bottom: none; }
        .mtc-table td.muted { color: #5A5854; font-style: italic; }
        .mtc-table td.stat { font-family: 'JetBrains Mono', monospace; color: #FF5A1F; }
        .mtc-edit-link { color: #FF5A1F; text-decoration: none; font-weight: 600; font-size: 13px; }
        .mtc-edit-link:hover { text-decoration: underline; }
        .mtc-links { text-align: center; margin-top: 24px; }
        .mtc-links a { color: #8A8A85; text-decoration: none; font-size: 13px; }
        .mtc-links a:hover { color: #F5F1EA; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Members</h1>
          <p className="mtc-count">{members.length} total</p>
        </div>

        <div className="mtc-admin-body">
          <div className="mtc-table-wrap">
            <table className="mtc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>WhatsApp</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>DOB</th>
                  <th>Joined</th>
                  <th>Distance</th>
                  <th>Elevation</th>
                  <th>Time</th>
                  <th>Activities</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td className={!m.whatsapp ? "muted" : ""}>{m.whatsapp || "Not set"}</td>
                    <td className={!m.email ? "muted" : ""}>{m.email || "Not set"}</td>
                    <td className={!m.address ? "muted" : ""}>{m.address || "Not set"}</td>
                    <td>{formatDob(m.date_of_birth)}</td>
                    <td>{formatJoined(m.created_at)}</td>
                    <td className="stat">{(m.stats.distance / 1000).toFixed(1)} km</td>
                    <td className="stat">{Math.round(m.stats.elevation)} m</td>
                    <td className="stat">{formatTime(m.stats.time)}</td>
                    <td className="stat">{m.stats.count}</td>
                    <td><a href={`/admin/members/${m.id}`} className="mtc-edit-link">Edit</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mtc-links">
            <a href="/api/admin/logout">Log out of admin</a>
          </div>
        </div>
      </div>
    </>
  );
}
