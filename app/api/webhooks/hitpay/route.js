import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "../../../../lib/supabase";

function verifyHitPayHmac(fields, salt) {
  const { hmac, ...rest } = fields;
  const sortedKeys = Object.keys(rest).sort();
  const concatenated = sortedKeys.map((k) => `${k}${rest[k]}`).join("");
  const computed = crypto.createHmac("sha256", salt).update(concatenated).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmac || ""));
  } catch {
    return false;
  }
}

export async function POST(request) {
  const formData = await request.formData();
  const fields = {};
  for (const [key, value] of formData.entries()) {
    fields[key] = value;
  }

  const isValid = verifyHitPayHmac(fields, process.env.HITPAY_SALT);
  if (!isValid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const orderId = fields.reference_number;
  const newStatus =
    fields.status === "completed" ? "paid" : fields.status === "failed" ? "failed" : fields.status;

  // If payment failed, restore any stock we reserved at checkout time
  if (newStatus === "failed") {
    const { data: order } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    // Only restore once — if this order was already marked failed before, don't double-restore
    if (order && order.status !== "failed") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      for (const item of items || []) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single();
        if (product && product.stock_quantity !== null) {
          await supabase
            .from("products")
            .update({ stock_quantity: product.stock_quantity + item.quantity })
            .eq("id", item.product_id);
        }
      }
    }
  }

  await supabase
    .from("orders")
    .update({
      status: newStatus,
      hitpay_reference: fields.payment_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return NextResponse.json({ received: true });
}
