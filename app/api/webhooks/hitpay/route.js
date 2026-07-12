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
