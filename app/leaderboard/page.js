import { createClient } from "@supabase/supabase-js";

async function getLeaderboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data, error } = await supabase.from("leaderboard").select("*");
  if (error) throw error;
  return data;
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
            <th style={{ padding: 8 }}>Distance (km)</th>
            <th style={{ padding: 8 }}>Activities</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.runner_id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{i + 1}</td>
              <td style={{ padding: 8 }}>{r.name}</td>
              <td style={{ padding: 8 }}>{(r.total_distance_m / 1000).toFixed(1)}</td>
              <td style={{ padding: 8 }}>{r.activity_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
