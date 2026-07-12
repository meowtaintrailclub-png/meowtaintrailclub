import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase";
import { getLoggedInRunnerId } from "../../../lib/session";

export const dynamic = "force-dynamic";

export default async function LeaveClub() {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    redirect("/");
  }

  const supabase = supabaseAdmin();
  const { data: runner } = await supabase
    .from("runners")
    .select("name")
    .eq("id", runnerId)
    .single();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
        .mtc-page { min-height: 100vh; background: #0D0D0D; color: #F5F1EA; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .mtc-card { max-width: 400px; width: 100%; background: #141311; border: 1px solid #3A2420; border-radius: 12px; padding: 32px; text-align: center; }
        .mtc-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #E07050; margin: 0 0 8px; }
        .mtc-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; margin: 0 0 14px; }
        .mtc-btn-danger { width: 100%; padding: 11px 22px; background: #B23B22; color: #F5F1EA; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; }
        .mtc-btn-ghost { display: inline-block; margin-top: 16px; color: #8A8A85; text-decoration: none; font-size: 14px; }
      `}</style>

      <main className="mtc-page">
        <div className="mtc-card">
          <p className="mtc-eyebrow">Meowtain Trail Club</p>
          <h1 className="mtc-title">Leave the club?</h1>
          <p style={{ color: "#8A8A85", fontSize: 14, marginBottom: 24 }}>
            {runner?.name ? `${runner.name}, this` : "This"} will permanently remove your profile
            and every activity you've logged. Your Strava account itself is not affected, and you
            can reconnect anytime to rejoin.
          </p>
          <form action="/api/profile/delete" method="POST">
            <button type="submit" className="mtc-btn-danger">Yes, remove me from the club</button>
          </form>
          <p><a href="/profile" className="mtc-btn-ghost">Cancel, take me back</a></p>
        </div>
      </main>
    </>
  );
}
