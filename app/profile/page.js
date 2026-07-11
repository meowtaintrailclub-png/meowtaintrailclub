import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { getLoggedInRunnerId } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function Profile() {
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

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", textAlign: "center", fontFamily: "sans-serif" }}>
      {runner.avatar_url && (
        <img src={runner.avatar_url} alt={runner.name} style={{ width: 96, height: 96, borderRadius: "50%", marginBottom: 16 }} />
      )}
      <h1>{runner.name}</h1>
      <p style={{ color: "#666" }}>Connected to Go-Tribe</p>

      <div style={{ marginTop: 32, textAlign: "left", background: "#f7f7f7", padding: 20, borderRadius: 8 }}>
        <p><strong>Activities:</strong> {totals.count}</p>
        <p><strong>Distance:</strong> {(totals.distance / 1000).toFixed(1)} km</p>
        <p><strong>Elevation:</strong> {Math.round(totals.elevation)} m</p>
        <p><strong>Time:</strong> {hours}h {minutes}m</p>
      </div>

      <form action="/api/profile/update" method="POST" style={{ marginTop: 24, textAlign: "left", background: "#f7f7f7", padding: 20, borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>My Details</h3>

        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>WhatsApp</label>
        <input type="text" name="whatsapp" defaultValue={runner.whatsapp || ""} placeholder="e.g. 0123456789" style={{ width: "100%", padding: 8, marginBottom: 16, boxSizing: "border-box" }} />

        <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Address</label>
        <input type="text" name="address" defaultValue={runner.address || ""} placeholder="e.g. your delivery address" style={{ width: "100%", padding: 8, marginBottom: 16, boxSizing: "border-box" }} />

        <button type="submit" style={{ padding: "10px 20px", background: "#fc4c02", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
          Save
        </button>
      </form>

      <p style={{ marginTop: 32 }}>
        <a href="/leaderboard">View this month's leaderboard →</a>
      </p>

      <p style={{ marginTop: 16 }}>
        <a href="/api/auth/logout" style={{ color: "#999" }}>Log out</a>
      </p>
    </main>
  );
}
