import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../lib/adminSession";

export const dynamic = "force-dynamic";

function formatJoined(createdAt) {
  const d = new Date(createdAt);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function EditMember({ params }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const supabase = supabaseAdmin();
  const { data: member, error } = await supabase
    .from("runners")
    .select("id, name, whatsapp, email, address, date_of_birth, gender, created_at")
    .eq("id", params.id)
    .single();

  if (error || !member) {
    notFound();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; padding-bottom: 60px; }
        .mtc-hero { padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid #201F1C; }
        .mtc-back { display: block; color: #8A8A85; font-size: 13px; text-decoration: none; margin-bottom: 18px; }
        .mtc-back:hover { color: #F5F1EA; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #FF5A1F; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 28px; margin: 0; }
        .mtc-joined { color: #8A8A85; font-size: 13px; margin-top: 8px; font-family: 'JetBrains Mono', monospace; }
        .mtc-body { max-width: 440px; margin: 28px auto 0; padding: 0 20px; }
        .mtc-details-card { background: #141311; border: 1px solid #201F1C; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-field-label { display: block; margin-bottom: 6px; font-size: 13px; color: #8A8A85; }
        .mtc-field-input { width: 100%; padding: 10px 12px; margin-bottom: 16px; box-sizing: border-box; background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 6px; color: #F5F1EA; font-family: 'Inter', sans-serif; font-size: 14px; }
        .mtc-field-input:focus { outline: none; border-color: #FF5A1F; }
        .mtc-btn-primary { display: inline-block; padding: 10px 22px; background: #FF5A1F; color: #0D0D0D; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; }
        .mtc-btn-ghost { display: inline-block; margin-left: 14px; color: #8A8A85; text-decoration: none; font-size: 14px; }
        .mtc-btn-ghost:hover { color: #F5F1EA; }
        .mtc-danger-card { margin-top: 16px; background: #1A1210; border: 1px solid #3A2420; border-radius: 10px; padding: 20px; text-align: left; }
        .mtc-danger-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; margin: 0 0 6px; color: #E88; }
        .mtc-btn-danger { display: inline-block; padding: 9px 18px; background: transparent; border: 1px solid #B23B22; color: #E07050; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none; }
        .mtc-btn-danger:hover { background: #2A1512; }
      `}</style>

      <div className="mtc-page">
        <div className="mtc-hero">
          <a href="/admin" className="mtc-back">&larr; Back to members</a>
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">{member.name}</h1>
          <p className="mtc-joined">Joined {formatJoined(member.created_at)}</p>
        </div>

        <div className="mtc-body">
          <form action="/api/admin/members/update" method="POST" className="mtc-details-card">
            <input type="hidden" name="runner_id" value={member.id} />

            <label className="mtc-field-label">Name</label>
            <input type="text" name="name" defaultValue={member.name || ""} className="mtc-field-input" />

            <label className="mtc-field-label">WhatsApp</label>
            <input type="text" name="whatsapp" defaultValue={member.whatsapp || ""} className="mtc-field-input" />

            <label className="mtc-field-label">Email</label>
            <input type="email" name="email" defaultValue={member.email || ""} className="mtc-field-input" />

            <label className="mtc-field-label">Address</label>
            <input type="text" name="address" defaultValue={member.address || ""} className="mtc-field-input" />

            <label className="mtc-field-label">Date of Birth</label>
            <input type="date" name="date_of_birth" defaultValue={member.date_of_birth || ""} className="mtc-field-input" />

            <label className="mtc-field-label">Gender</label>
            <select name="gender" defaultValue={member.gender || ""} className="mtc-field-input">
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <button type="submit" className="mtc-btn-primary">Save changes</button>
            <a href="/admin" className="mtc-btn-ghost">Cancel</a>
          </form>

          <div className="mtc-danger-card">
            <p className="mtc-danger-title">Danger zone</p>
            <p style={{ color: "#8A8A85", fontSize: 13, marginBottom: 14 }}>
              Removing a member deletes their profile and all logged activities. This cannot be undone.
            </p>
            <a href={`/admin/members/${member.id}/delete`} className="mtc-btn-danger">Delete this member</a>
          </div>
        </div>
      </div>
    </>
  );
}
