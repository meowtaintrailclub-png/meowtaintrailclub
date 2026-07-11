import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const month = formData.get("month");
  const prizes = formData.get("prizes") || "";
  const lucky_draw = formData.get("lucky_draw") || "";

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("challenge_rewards")
    .upsert(
      { month, prizes, lucky_draw, updated_at: new Date().toISOString() },
      { onConflict: "month" }
    );

  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/prizes?month=${month}`);
}
