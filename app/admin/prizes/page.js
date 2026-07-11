import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAdminLoggedIn } from "../../../lib/adminSession";

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

export default async function PrizesAdmin({ searchParams }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const currentMonth = monthKey(new Date());
  const availableMonths = await getAvailableMonths();
  const monthsToShow = Array.from(new Set([currentMonth, ...availableMonths])).sort().reverse();

  const requestedMonth = searchParams?.month;
  const selectedMonth =
    requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : currentMonth;

  const supabase = supabaseAdmin();
  const { data: reward } = await supabase
    .from("challenge_rewards")
    .select("prizes, lucky_draw")
    .eq("month", selectedMonth)
    .maybeSingle();

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
        .mtc-body { max-width: 520px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-filter-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A5854; margin: 0 0 8px; }
        .mtc-filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
        .mtc-filter-pill { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 7px 14px; border-radius: 20px; border: 1px solid #2A2A2A; color: #8A8A85; text-decoration: none; }
        .mtc-filter-pill:hover { border-color: #3A3733; color: #F5F1EA; }
        .mtc-filter-pill.active { background: #FF5A1F; border-color: #FF5A1F; color: #0D0D0D; font-weight: 600; }
        .mtc-details-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-textarea { width: 100%; padding: 10px 12px; margin-bottom: 18px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; min-height: 90px; resize: vertical; }
        .mtc-field-textarea:focus { outline: none; border-color: #FF5A1F; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin" className="mtc-back">&larr; Back to members</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Prizes &amp; Lucky Draw</h1>
        </div>

        <div className="mtc-body">
          <p className="mtc-filter-label">Month</p>
          <div className="mtc-filter-row">
            {monthsToShow.map((m) => (
              <a key={m} href={`/admin/prizes?month=${m}`} className={`mtc-filter-pill ${m === selectedMonth ? "active" : ""}`}>{monthLabel(m)}</a>
            ))}
          </div>

          <form action="/api/admin/prizes/update" method="POST" className="mtc-details-card">
            <input type="hidden" name="month" value={selectedMonth} />

            <label className="mtc-field-label">Prizes for {monthLabel(selectedMonth)}</label>
            <textarea
              name="prizes"
              defaultValue={reward?.prizes || ""}
              placeholder="e.g. 1st place: RM200 voucher, 2nd place: trail shoes, 3rd place: club merch"
              className="mtc-field-textarea"
            />

            <label className="mtc-field-label">Lucky Draw</label>
            <textarea
              name="lucky_draw"
              defaultValue={reward?.lucky_draw || ""}
              placeholder="e.g. All runners who log at least 3 runs this month are entered into a draw for a hydration vest"
              className="mtc-field-textarea"
            />

            <button type="submit" className="mtc-btn-primary">Save</button>
          </form>
        </div>
      </div>
    </>
  );
}
