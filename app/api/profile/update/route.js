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

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("runners")
    .update({ whatsapp, address })
    .eq("id", runnerId);

  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile`);
}
