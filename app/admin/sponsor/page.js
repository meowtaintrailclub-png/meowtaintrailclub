import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { isAdminLoggedIn } from "../../../lib/adminSession";

export const dynamic = "force-dynamic";

async function getSponsors() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export default async function SponsorsAdmin() {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const sponsors = await getSponsors();

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
        .mtc-details-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-details-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 8px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-hint { color: #5A5854; font-size: 12px; margin: 0 0 16px; line-height: 1.5; }
        .mtc-hint code { background: #0D0D0D; padding: 1px 5px; border-radius: 3px; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-btn-danger { padding: 7px 14px; background: transparent; border: 1px solid #B23B22; color: #E07050; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; }
        .mtc-list-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; margin-top: 16px; text-align: left; }
        .mtc-empty-text { color: #5A5854; font-size: 14px; font-style: italic; }
        .mtc-sponsor-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #201F1C; }
        .mtc-sponsor-row:last-child { border-bottom: none; }
        .mtc-sponsor-thumb { width: 48px; height: 48px; object-fit: contain; background: #F5F1EA; border-radius: 6px; padding: 6px; }
        .mtc-sponsor-name { font-weight: 600; font-size: 14px; margin: 0; }
        .mtc-sponsor-url { color: #8A8A85; font-size: 12px; margin: 2px 0 0; word-break: break-all; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin" className="mtc-back">&larr; Back to members</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Sponsors</h1>
        </div>

        <div className="mtc-body">
          <form action="/api/admin/sponsors/add" method="POST" className="mtc-details-card">
            <p className="mtc-details-title">Add a sponsor</p>

            <label className="mtc-field-label">Sponsor Name</label>
            <input type="text" name="name" required className="mtc-field-input" placeholder="e.g. Trail Gear Co." />

            <label className="mtc-field-label">Logo filename</label>
            <input type="text" name="logo_path" required className="mtc-field-input" placeholder="e.g. sponsor-trailgear.png" />
            <p className="mtc-hint">
              Upload the logo image to your GitHub repo's <code>public</code> folder first (same way you added
              <code> Meowtain-logo.jpeg</code>), then type its exact filename here.
            </p>

            <label className="mtc-field-label">Website (optional)</label>
            <input type="url" name="website_url" className="mtc-field-input" placeholder="https://..." />

            <div style={{ marginTop: 8 }}>
              <button type="submit" className="mtc-btn-primary">Add Sponsor</button>
            </div>
          </form>

          <div className="mtc-list-card">
            <p className="mtc-details-title">Current sponsors</p>
            {sponsors.length === 0 ? (
              <p className="mtc-empty-text">No sponsors added yet.</p>
            ) : (
              sponsors.map((s) => (
                <div className="mtc-sponsor-row" key={s.id}>
                  <img src={`/${s.logo_path}`} alt={s.name} className="mtc-sponsor-thumb" />
                  <div style={{ flex: 1 }}>
                    <p className="mtc-sponsor-name">{s.name}</p>
                    {s.website_url && <p className="mtc-sponsor-url">{s.website_url}</p>}
                  </div>
                  <form action="/api/admin/sponsors/delete" method="POST">
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="mtc-btn-danger">Remove</button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
