import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { getLoggedInRunnerId } from "../../../../lib/session";

export async function POST(request) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  }

  const formData = await request.formData();
  const whatsapp = formData.get("whatsapp") || "";
  const address = formData.get("address") || "";
  const email = formData.get("email") || "";
  const date_of_birth = formData.get("date_of_birth") || null;
  const gender = formData.get("gender") || null;

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("runners")
    .update({ whatsapp, address, email, date_of_birth, gender })
    .eq("id", runnerId);

  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile`);
}
