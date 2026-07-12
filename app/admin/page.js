import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { isAdminLoggedIn } from "../../lib/adminSession";

export const dynamic = "force-dynamic";

const TIERS = [3000, 4000, 5000, 6000, 7000];

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

function tierForElevation(elevationM) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (elevationM >= TIERS[i]) return TIERS[i];
  }
  return null;
}

function formatTime(totalSeconds) {
  const seconds = Number(totalSeconds) || 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
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

async function getMembers(selectedMonth, gender) {
  const supabase = supabaseAdmin();

  let runnersQuery = supabase
    .from("runners")
    .select("id, name, created_at, gender")
    .order("created_at", { ascending: false });
  if (gender !== "all") {
    runnersQuery = runnersQuery.eq("gender", gender);
  }
  const { data: runners, error: runnersError } = await runnersQuery;
  if (runnersError) throw runnersError;

  let activitiesQuery = supabase
    .from("activities")
    .select("runner_id, distance_m, elevation_gain_m, moving_time_s, started_at");

  if (selectedMonth !== "all") {
    const { start, end } = monthBounds(selectedMonth);
    activitiesQuery = activitiesQuery.gte("started_at", start).lt("started_at", end);
  }

  const { data: activities, error: activitiesError } = await activitiesQuery;
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

export default async function AdminPage({ searchParams }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const currentMonth = monthKey(new Date());
  const availableMonths = await getAvailableMonths();
  const monthsToShow = Array.from(new Set([currentMonth, ...availableMonths])).sort().reverse();

  const requestedMonth = searchParams?.month;
  let selectedMonth;
  if (requestedMonth === "all") {
    selectedMonth = "all";
  } else if (requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth)) {
    selectedMonth = requestedMonth;
  } else {
    selectedMonth = currentMonth;
  }

  const requestedTier = searchParams?.tier;
  const selectedTier = TIERS.includes(Number(requestedTier)) ? Number(requestedTier) : "all";

  const requestedGender = searchParams?.gender;
  const selectedGender = ["male", "female"].includes(requestedGender) ? requestedGender : "all";

  const qs = (overrides) => {
    const params = new URLSearchParams();
    const month = overrides.month ?? selectedMonth;
    const tier = overrides.tier ?? selectedTier;
    const gender = overrides.gender ?? selectedGender;
    params.set("month", month);
    if (tier !== "all") params.set("tier", tier);
    if (gender !== "all") params.set("gender", gender);
    return `/admin?${params.toString()}`;
  };

  const allMembers = await getMembers(selectedMonth, selectedGender);

  const members =
    selectedTier === "all"
      ? allMembers
      : allMembers.filter((m) => tierForElevation(m.stats.elevation) === selectedTier);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 32px; margin: 0; }
        .mtc-count { color: #8A8A85; font-size: 13px; margin-top: 6px; }
        .mtc-nav-row { margin-top: 16px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .mtc-nav-row a { font-size: 13px; color: #FF5A1F; text-decoration: none; font-weight: 600; }
        .mtc-nav-row a:hover { text-decoration: underline; }
        .mtc-admin-body { max-width: 900px; margin: 24px auto 0; padding: 0 20px; }
        .mtc-filter-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A5854; margin: 0 0 8px; }
        .mtc-filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
        .mtc-filter-pill { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 7px 14px; border-radius: 20px; border: 1px solid #2A2A2A; color: #8A8A85; text-decoration: none; }
        .mtc-filter-pill:hover { border-color: #3A3733; color: #F5F1EA; }
        .mtc-filter-pill.active { background: #FF5A1F; border-color: #FF5A1F; color: #0D0D0D; font-weight: 600; }
        .mtc-table-wrap { overflow-x: auto; border: 1px solid #201F1C; border-radius: 10px; }
        .mtc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .mtc-table th { text-align: left; padding: 12px 14px; background: #141311; color: #8A8A85; font-weight: 500; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #201F1C; }
        .mtc-table td { padding: 12px 14px; border-bottom: 1px solid #201F1C; color: #F5F1EA; }
        .mtc-table tr:last-child td { border-bottom: none; }
        .mtc-table td.stat { font-family: 'JetBrains Mono', monospace; color: #FF5A1F; }
        .mtc-name-link { color: #F5F1EA; text-decoration: none; font-weight: 600; }
        .mtc-name-link:hover { color: #FF5A1F; }
        .mtc-empty-row { text-align: center; color: #8A8A85; padding: 30px 14px; }
        .mtc-links { text-align: center; margin-top: 24px; }
        .mtc-links a { color: #8A8A85; text-decoration: none; font-size: 13px; }
        .mtc-links a:hover { color: #F5F1EA; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Members</h1>
          <p className="mtc-count">
            {members.length} shown &middot; {selectedMonth === "all" ? "All time" : monthLabel(selectedMonth)}
          </p>
          <p className="mtc-nav-row">
            <a href="/admin/prizes">Manage Prizes &amp; Lucky Draw &rarr;</a>
            <a href="/admin/sponsors">Manage Sponsors &rarr;</a>
            <a href="/admin/products">Manage Products &rarr;</a>
            <a href="/admin/orders">Manage Orders &rarr;</a>
            <a href="/admin/reports">View Reports &rarr;</a>
          </p>
        </div>

        <div className="mtc-admin-body">
          <p className="mtc-filter-label">Period</p>
          <div className="mtc-filter-row">
            <a href={qs({ month: "all" })} className={`mtc-filter-pill ${selectedMonth === "all" ? "active" : ""}`}>All time</a>
            {monthsToShow.map((m) => (
              <a key={m} href={qs({ month: m })} className={`mtc-filter-pill ${m === selectedMonth ? "active" : ""}`}>{monthLabel(m)}</a>
            ))}
          </div>

          <p className="mtc-filter-label">Elevation Tier</p>
          <div className="mtc-filter-row">
            <a href={qs({ tier: "all" })} className={`mtc-filter-pill ${selectedTier === "all" ? "active" : ""}`}>All</a>
            {TIERS.map((t) => (
              <a key={t} href={qs({ tier: t })} className={`mtc-filter-pill ${t === selectedTier ? "active" : ""}`}>{t}m</a>
            ))}
          </div>

          <p className="mtc-filter-label">Gender</p>
          <div className="mtc-filter-row">
            <a href={qs({ gender: "all" })} className={`mtc-filter-pill ${selectedGender === "all" ? "active" : ""}`}>All</a>
            <a href={qs({ gender: "male" })} className={`mtc-filter-pill ${selectedGender === "male" ? "active" : ""}`}>Male</a>
            <a href={qs({ gender: "female" })} className={`mtc-filter-pill ${selectedGender === "female" ? "active" : ""}`}>Female</a>
          </div>

          <div className="mtc-table-wrap">
            <table className="mtc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Distance</th>
                  <th>Elevation</th>
                  <th>Time</th>
                  <th>Activities</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="mtc-empty-row">No runners match this filter.</td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id}>
                      <td><a href={`/admin/members/${m.id}`} className="mtc-name-link">{m.name}</a></td>
                      <td className="stat">{(m.stats.distance / 1000).toFixed(1)} km</td>
                      <td className="stat">{Math.round(m.stats.elevation)} m</td>
                      <td className="stat">{formatTime(m.stats.time)}</td>
                      <td className="stat">{m.stats.count}</td>
                    </tr>
                  ))
                )}
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
