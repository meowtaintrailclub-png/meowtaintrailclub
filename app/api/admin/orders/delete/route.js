import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const id = formData.get("id");

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders`);
}
