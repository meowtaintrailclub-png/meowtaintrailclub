import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { getLoggedInRunnerId } from "../../../lib/session";
import { getCart, CART_COOKIE_NAME } from "../../../lib/cart";

export async function POST(request) {
  const runnerId = getLoggedInRunnerId();
  if (!runnerId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`, 303);
  }

  const cart = getCart();
  if (!cart.length) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/shop`, 303);
  }

  const formData = await request.formData();
  const shipping_name = formData.get("shipping_name") || "";
  const shipping_phone = formData.get("shipping_phone") || "";
  const shipping_address = formData.get("shipping_address") || "";

  const supabase = supabaseAdmin();

  const { data: runner } = await supabase
    .from("runners")
    .select("email")
    .eq("id", runnerId)
    .single();

  const productIds = [...new Set(cart.map((item) => item.product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price")
    .in("id", productIds);
  if (productsError) throw productsError;

  const productMap = {};
  for (const p of products) productMap[p.id] = p;

  let total = 0;
  const orderItemsToInsert = [];
  for (const item of cart) {
    const product = productMap[item.product_id];
    if (!product) continue;
    const lineTotal = Number(product.price) * item.quantity;
    total += lineTotal;
    orderItemsToInsert.push({
      product_id: product.id,
      product_name: product.name,
      size: item.size,
      quantity: item.quantity,
      unit_price: product.price,
    });
  }

  if (orderItemsToInsert.length === 0) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/shop`, 303);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      runner_id: runnerId,
      status: "pending",
      total_amount: total,
      shipping_name,
      shipping_phone,
      shipping_address,
    })
    .select()
    .single();
  if (orderError) throw orderError;

  const itemsWithOrderId = orderItemsToInsert.map((item) => ({ ...item, order_id: order.id }));
  const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);
  if (itemsError) throw itemsError;

  const hitpayResponse = await fetch(`${process.env.HITPAY_API_BASE_URL}/v1/payment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BUSINESS-API-KEY": process.env.HITPAY_API_KEY,
    },
    body: JSON.stringify({
      amount: total.toFixed(2),
      currency: "MYR",
      email: runner?.email || "no-reply@example.com",
      name: shipping_name,
      phone: shipping_phone,
      purpose: "Meowtain Trail Club Shop Order",
      reference_number: order.id,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/order/${order.id}`,
      webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/hitpay`,
      send_email: "true",
    }),
  });

  if (!hitpayResponse.ok) {
    const errText = await hitpayResponse.text();
    console.error("HitPay error", errText);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/shop?error=payment`, 303);
  }

  const hitpayData = await hitpayResponse.json();

  await supabase
    .from("orders")
    .update({ hitpay_payment_request_id: hitpayData.id })
    .eq("id", order.id);

  const response = NextResponse.redirect(hitpayData.url, 303);
  response.cookies.set(CART_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
