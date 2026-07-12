import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { getLoggedInRunnerId } from "../../../../lib/session";

export async function POST() {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("runners").delete().eq("id", runnerId);
  if (error) throw error;

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  response.cookies.set("gotribe_runner_id", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
