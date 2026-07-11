import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const runnerId = formData.get("runner_id");
  const name = formData.get("name") || "";
  const whatsapp = formData.get("whatsapp") || "";
  const email = formData.get("email") || "";
  const address = formData.get("address") || "";
  const date_of_birth = formData.get("date_of_birth") || null;

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("runners")
    .update({ name, whatsapp, email, address, date_of_birth })
    .eq("id", runnerId);

  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin`);
}
