import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const website_url = formData.get("website_url") || null;
  const file = formData.get("logo");

  if (!file || typeof file === "string") {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/sponsors`);
  }

  const supabase = supabaseAdmin();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const fileName = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("sponsor-logos")
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("sponsor-logos").getPublicUrl(fileName);

  const { error: insertError } = await supabase
    .from("sponsors")
    .insert({ name, logo_url: urlData.publicUrl, website_url });

  if (insertError) throw insertError;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/sponsors`);
}
