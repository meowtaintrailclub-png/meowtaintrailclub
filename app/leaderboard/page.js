export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";

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

export default async function Leaderboard() {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const rows = await getLeaderboard();

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <p><a href="/profile">← Back to my profile</a></p>
      <h1>This Month's Leaderboard</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #333" }}>
            <th style={{ padding: 8 }}>#</th>
            <th style={{ padding: 8 }}>Runner</th>
            <th style={{ padding: 8 }}>Elevation (m)</th>
            <th style={{ padding: 8 }}>Distance (km)</th>
            <th style={{ padding: 8 }}>Time</th>
            <th style={{ padding: 8 }}>Activities</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.runner_id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{i + 1}</td>
              <td style={{ padding: 8 }}>{r.name}</td>
              <td style={{ padding: 8 }}>{Math.round(r.total_elevation_m)}</td>
              <td style={{ padding: 8 }}>{(r.total_distance_m / 1000).toFixed(1)}</td>
              <td style={{ padding: 8 }}>{formatTime(r.total_moving_time_s)}</td>
              <td style={{ padding: 8 }}>{r.activity_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
