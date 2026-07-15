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
  const stockRaw = formData.get("stock_quantity");
  const stock_quantity = !stockRaw || stockRaw === "" ? null : parseInt(stockRaw, 10);
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

  const { data: newProduct, error: insertError } = await supabase
    .from("products")
    .insert({ name, description, price, stock_quantity, image_url })
    .select()
    .single();
  if (insertError) throw insertError;

  const variantSizes = formData.getAll("variant_size");
  const variantColors = formData.getAll("variant_color");
  const variantStocks = formData.getAll("variant_stock");

  const variantsToInsert = [];
  for (let i = 0; i < variantStocks.length; i++) {
    const size = (variantSizes[i] || "").trim();
    const color = (variantColors[i] || "").trim();
    const stockRawVariant = variantStocks[i];
    if (stockRawVariant !== "" && stockRawVariant != null && (size || color)) {
      variantsToInsert.push({
        product_id: newProduct.id,
        size: size || null,
        color: color || null,
        stock_quantity: parseInt(stockRawVariant, 10) || 0,
      });
    }
  }

  if (variantsToInsert.length > 0) {
    const { error: variantsError } = await supabase.from("product_variants").insert(variantsToInsert);
    if (variantsError) throw variantsError;
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/products`);
}
