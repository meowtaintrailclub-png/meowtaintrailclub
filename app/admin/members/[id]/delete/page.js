import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export const dynamic = "force-dynamic";

export default async function DeleteMemberConfirm({ params }) {
  if (!isAdminLoggedIn()) {
    redirect("/admin/login");
  }

  const supabase = supabaseAdmin();
  const { data: member, error } = await supabase
    .from("runners")
    .select("id, name")
    .eq("id", params.id)
    .single();

  if (error || !member) {
    notFound();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .mtc-confirm-card { max-width: 400px; width: 100%; background: #141311; border: 1px solid #3A2420; border-radius: 12px; padding: 32px; text-align: center; }
        .mtc-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #E07050; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; margin: 0 0 14px; }
        .mtc-btn-danger { width: 100%; padding: 11px 22px; background: #B23B22; color: #F5F1EA; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-btn-ghost { color: #8A8A85; text-decoration: none; font-size: 14px; }
        .mtc-btn-ghost:hover { color: #F5F1EA; }
      `}</style>

      <main className="mtc-page">
        <div className="mtc-confirm-card">
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Delete {member.name}?</h1>
          <p style={{ color: "#8A8A85", fontSize: 14, marginBottom: 24 }}>
            This permanently removes {member.name}'s profile and every activity they've logged. This cannot be undone.
          </p>
          <form action="/api/admin/members/delete" method="POST">
            <input type="hidden" name="runner_id" value={member.id} />
            <button type="submit" className="mtc-btn-danger">Yes, delete permanently</button>
          </form>
          <p style={{ marginTop: 16 }}>
            <a href={`/admin/members/${member.id}`} className="mtc-btn-ghost">Cancel</a>
          </p>
        </div>
      </main>
    </>
  );
}
