import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAdminLoggedIn } from "../../../lib/adminSession";

export const dynamic = "force-dynamic";

function getMalaysiaToday() {
  const now = new Date();
  const myt = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const y = myt.getUTCFullYear();
  const m = String(myt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(myt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function malaysiaMidnightUTC(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - 8 * 60 * 60 * 1000).toISOString();
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function formatDateStr(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ReportsAdmin({ searchParams }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const today = getMalaysiaToday();
  const isCustom = !!(searchParams?.from || searchParams?.to);
  const preset = isCustom ? null : searchParams?.range || "month";

  let fromDate = searchParams?.from || "";
  let toDate = searchParams?.to || "";

  if (!isCustom) {
    if (preset === "today") {
      fromDate = today;
      toDate = today;
    } else if (preset === "week") {
      const [y, m, d] = today.split("-").map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      const diffToMonday = dow === 0 ? 6 : dow - 1;
      fromDate = addDays(today, -diffToMonday);
      toDate = today;
    } else if (preset === "month") {
      const [y, m] = today.split("-");
      fromDate = `${y}-${m}-01`;
      toDate = today;
    } else if (preset === "all") {
      fromDate = "";
      toDate = "";
    }
  }

  const fromUTC = fromDate ? malaysiaMidnightUTC(fromDate) : null;
  const toUTC = toDate ? malaysiaMidnightUTC(addDays(toDate, 1)) : null;

  const supabase = supabaseAdmin();

  let signupsQuery = supabase.from("runners").select("id, created_at");
  if (fromUTC) signupsQuery = signupsQuery.gte("created_at", fromUTC);
  if (toUTC) signupsQuery = signupsQuery.lt("created_at", toUTC);
  const { data: signups, error: signupsError } = await signupsQuery;
  if (signupsError) throw signupsError;

  let ordersQuery = supabase.from("orders").select("id, status, total_amount, created_at");
  if (fromUTC) ordersQuery = ordersQuery.gte("created_at", fromUTC);
  if (toUTC) ordersQuery = ordersQuery.lt("created_at", toUTC);
  const { data: orders, error: ordersError } = await ordersQuery;
  if (ordersError) throw ordersError;

  const paidOrders = orders.filter((o) => o.status === "paid");
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const failedCount = orders.filter((o) => o.status === "failed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 18px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 30px; margin: 0; }
        .mtc-body { max-width: 560px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-filter-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A5854; margin: 0 0 8px; }
        .mtc-filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .mtc-filter-pill { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 7px 14px; border-radius: 20px; border: 1px solid #2A2A2A; color: #8A8A85; text-decoration: none; }
        .mtc-filter-pill:hover { border-color: #3A3733; color: #F5F1EA; }
        .mtc-filter-pill.active { background: #FF5A1F; border-color: #FF5A1F; color: #0D0D0D; font-weight: 600; }
        .mtc-custom-form { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 16px; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 12px; color: #8A8A85; }
        .mtc-field-input { padding: 8px 10px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 13px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-btn-primary { padding: 9px 18px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }
        .mtc-range-label { text-align: center; color: #8A8A85; font-size: 13px; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; }
        .mtc-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .mtc-stat-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 18px; text-align: center; }
        .mtc-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 600; color: #FF5A1F; }
        .mtc-stat-label { font-size: 12px; color: #8A8A85; margin-top: 4px; letter-spacing: 0.04em; text-transform: uppercase; }
        .mtc-breakdown-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; margin: 0 0 12px; }
        .mtc-breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #201F1C; font-size: 14px; }
        .mtc-breakdown-row:last-child { border-bottom: none; }
        .mtc-breakdown-row span:first-child { color: #8A8A85; }
        .mtc-breakdown-row span:last-child { font-family: 'JetBrains Mono', monospace; color: #F5F1EA; font-weight: 600; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin" className="mtc-back">&larr; Back to members</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Reports</h1>
        </div>

        <div className="mtc-body">
          <p className="mtc-filter-label">Period</p>
          <div className="mtc-filter-row">
            <a href="/admin/reports?range=today" className={`mtc-filter-pill ${!isCustom && preset === "today" ? "active" : ""}`}>Today</a>
            <a href="/admin/reports?range=week" className={`mtc-filter-pill ${!isCustom && preset === "week" ? "active" : ""}`}>This Week</a>
            <a href="/admin/reports?range=month" className={`mtc-filter-pill ${!isCustom && preset === "month" ? "active" : ""}`}>This Month</a>
            <a href="/admin/reports?range=all" className={`mtc-filter-pill ${!isCustom && preset === "all" ? "active" : ""}`}>All Time</a>
          </div>

          <form action="/admin/reports" method="GET" className="mtc-custom-form">
            <div>
              <label className="mtc-field-label">From</label>
              <input type="date" name="from" defaultValue={fromDate} className="mtc-field-input" />
            </div>
            <div>
              <label className="mtc-field-label">To</label>
              <input type="date" name="to" defaultValue={toDate} className="mtc-field-input" />
            </div>
            <button type="submit" className="mtc-btn-primary">Apply</button>
          </form>

          <p className="mtc-range-label">
            {fromDate && toDate ? `${formatDateStr(fromDate)} \u2014 ${formatDateStr(toDate)}` : "All time"}
          </p>

          <div className="mtc-stats-grid">
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{signups.length}</div>
              <div className="mtc-stat-label">New Signups</div>
            </div>
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{paidOrders.length}</div>
              <div className="mtc-stat-label">Paid Orders</div>
            </div>
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">RM {totalRevenue.toFixed(2)}</div>
              <div className="mtc-stat-label">Revenue</div>
            </div>
            <div className="mtc-stat-card">
              <div className="mtc-stat-value">{orders.length}</div>
              <div className="mtc-stat-label">Total Orders</div>
            </div>
          </div>

          <div className="mtc-breakdown-card">
            <p className="mtc-details-title">Order Status Breakdown</p>
            <div className="mtc-breakdown-row"><span>Paid</span><span>{paidOrders.length}</span></div>
            <div className="mtc-breakdown-row"><span>Pending</span><span>{pendingCount}</span></div>
            <div className="mtc-breakdown-row"><span>Failed</span><span>{failedCount}</span></div>
            <div className="mtc-breakdown-row"><span>Cancelled</span><span>{cancelledCount}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
