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
    .select("id, name, price, stock_quantity")
    .in("id", productIds);
  if (productsError) throw productsError;

  const productMap = {};
  for (const p of products) productMap[p.id] = p;

  const variantIds = [...new Set(cart.map((item) => item.variant_id).filter(Boolean))];
  let variantMap = {};
  if (variantIds.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, product_id, size, color, stock_quantity")
      .in("id", variantIds);
    if (variantsError) throw variantsError;
    for (const v of variants) variantMap[v.id] = v;
  }

  // Combine needed quantities: per-variant for variant items, per-product for simple items
  const neededPerVariant = {};
  const neededPerProduct = {};
  for (const item of cart) {
    if (item.variant_id) {
      neededPerVariant[item.variant_id] = (neededPerVariant[item.variant_id] || 0) + item.quantity;
    } else {
      neededPerProduct[item.product_id] = (neededPerProduct[item.product_id] || 0) + item.quantity;
    }
  }

  // Check stock BEFORE creating anything — this is what actually prevents overselling
  for (const [variantId, neededQty] of Object.entries(neededPerVariant)) {
    const variant = variantMap[variantId];
    if (!variant) continue;
    if (neededQty > variant.stock_quantity) {
      const product = productMap[variant.product_id];
      const params = new URLSearchParams({
        error: "stock",
        product: product ? product.name : "item",
        available: String(variant.stock_quantity),
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/cart?${params.toString()}`, 303);
    }
  }
  for (const [productId, neededQty] of Object.entries(neededPerProduct)) {
    const product = productMap[productId];
    if (!product) continue;
    if (product.stock_quantity !== null && neededQty > product.stock_quantity) {
      const params = new URLSearchParams({
        error: "stock",
        product: product.name,
        available: String(product.stock_quantity),
      });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/cart?${params.toString()}`, 303);
    }
  }

  let total = 0;
  const orderItemsToInsert = [];
  for (const item of cart) {
    const product = productMap[item.product_id];
    if (!product) continue;
    const variant = item.variant_id ? variantMap[item.variant_id] : null;
    const lineTotal = Number(product.price) * item.quantity;
    total += lineTotal;
    orderItemsToInsert.push({
      product_id: product.id,
      product_name: product.name,
      variant_id: item.variant_id || null,
      size: variant ? variant.size : item.size,
      color: variant ? variant.color : null,
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

  // Reserve stock now, at order creation — this is what stops two people both
  // "successfully" checking out for the last item. If payment later fails,
  // the webhook restores it.
  for (const [variantId, neededQty] of Object.entries(neededPerVariant)) {
    const variant = variantMap[variantId];
    if (!variant) continue;
    await supabase
      .from("product_variants")
      .update({ stock_quantity: variant.stock_quantity - neededQty })
      .eq("id", variantId);
  }
  for (const [productId, neededQty] of Object.entries(neededPerProduct)) {
    const product = productMap[productId];
    if (!product || product.stock_quantity === null) continue;
    await supabase
      .from("products")
      .update({ stock_quantity: product.stock_quantity - neededQty })
      .eq("id", productId);
  }

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
    // Restore stock since this order won't be paid
    for (const [variantId, neededQty] of Object.entries(neededPerVariant)) {
      const variant = variantMap[variantId];
      if (!variant) continue;
      await supabase
        .from("product_variants")
        .update({ stock_quantity: variant.stock_quantity })
        .eq("id", variantId);
    }
    for (const [productId, neededQty] of Object.entries(neededPerProduct)) {
      const product = productMap[productId];
      if (!product || product.stock_quantity === null) continue;
      await supabase
        .from("products")
        .update({ stock_quantity: product.stock_quantity })
        .eq("id", productId);
    }
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
