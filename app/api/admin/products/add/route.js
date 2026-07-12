import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const description = formData.get("description") || "";
  const price = formData.get("price");
  const file = formData.get("image");

  const supabase = supabaseAdmin();
  let image_url = null;

  if (file && typeof file !== "string" && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const fileName = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    image_url = urlData.publicUrl;
  }

  const { error: insertError } = await supabase
    .from("products")
    .insert({ name, description, price, image_url });
  if (insertError) throw insertError;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/products`);
}
