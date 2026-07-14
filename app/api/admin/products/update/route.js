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

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/products`);
}
