import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const name = formData.get("name") || "";
  const logo_filename = formData.get("logo_filename") || "";
  const website_url = formData.get("website_url") || "";
  const sort_order = Number(formData.get("sort_order")) || 0;

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("sponsors")
    .insert({ name, logo_filename, website_url, sort_order });

  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/sponsors`);
}
