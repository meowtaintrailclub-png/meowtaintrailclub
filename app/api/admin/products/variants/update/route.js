import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const id = formData.get("id");
  const product_id = formData.get("product_id");
  const size = formData.get("size") || null;
  const color = formData.get("color") || null;
  const stock_quantity = parseInt(formData.get("stock_quantity") || "0", 10);

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("product_variants")
    .update({ size, color, stock_quantity })
    .eq("id", id);
  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/products/${product_id}`);
}
