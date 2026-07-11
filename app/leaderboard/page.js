export const dynamic = "force-dynamic";

import { supabaseAdmin } from "../../lib/supabase";

async function getLeaderboard() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("total_elevation_m", { ascending: false });
  if (error) throw error;
  return data;
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default async function Leaderboard() {
  const rows = await getLeaderboard();

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
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
