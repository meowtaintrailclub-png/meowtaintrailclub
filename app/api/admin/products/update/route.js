import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const id = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description") || "";
  const price = formData.get("price");
  const stockRaw = formData.get("stock_quantity");
  const stock_quantity = stockRaw === "" ? null : parseInt(stockRaw, 10);
  const active = formData.get("active") === "on";

  const supabase = supabaseAdmin();

  const { error } = await supabase
    .from("products")
    .update({ name, description, price, stock_quantity, active })
    .eq("id", id);
  if (error) throw error;

  // Update existing variants
  const existingIds = formData.getAll("variant_existing_id");
  const existingSizes = formData.getAll("variant_existing_size");
  const existingColors = formData.getAll("variant_existing_color");
  const existingStocks = formData.getAll("variant_existing_stock");

  for (let i = 0; i < existingIds.length; i++) {
    const variantId = existingIds[i];
    const size = (existingSizes[i] || "").trim() || null;
    const color = (existingColors[i] || "").trim() || null;
    const stock = parseInt(existingStocks[i] || "0", 10);
    const { error: variantError } = await supabase
      .from("product_variants")
      .update({ size, color, stock_quantity: stock })
      .eq("id", variantId);
    if (variantError) throw variantError;
  }

  // Insert any new variant rows added on this save
  const newSizes = formData.getAll("variant_new_size");
  const newColors = formData.getAll("variant_new_color");
  const newStocks = formData.getAll("variant_new_stock");

  const variantsToInsert = [];
  for (let i = 0; i < newStocks.length; i++) {
    const size = (newSizes[i] || "").trim();
    const color = (newColors[i] || "").trim();
    const stockRawNew = newStocks[i];
    if (stockRawNew !== "" && stockRawNew != null && (size || color)) {
      variantsToInsert.push({
        product_id: id,
        size: size || null,
        color: color || null,
        stock_quantity: parseInt(stockRawNew, 10) || 0,
      });
    }
  }
  if (variantsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("product_variants").insert(variantsToInsert);
    if (insertError) throw insertError;
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/products`);
}
