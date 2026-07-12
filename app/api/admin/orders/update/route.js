import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";
import { isAdminLoggedIn } from "../../../../../lib/adminSession";

export async function POST(request) {
  if (!isAdminLoggedIn()) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login`);
  }

  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");
  const fulfilled = formData.get("fulfilled") === "on";
  const shipping_name = formData.get("shipping_name") || "";
  const shipping_phone = formData.get("shipping_phone") || "";
  const shipping_address = formData.get("shipping_address") || "";

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      fulfilled,
      shipping_name,
      shipping_phone,
      shipping_address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders`);
}
