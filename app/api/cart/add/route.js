import { NextResponse } from "next/server";
import { getCart, CART_COOKIE_NAME } from "../../../../lib/cart";

export async function POST(request) {
  const formData = await request.formData();
  const productId = formData.get("product_id");
  const size = formData.get("size");
  const quantity = Math.max(1, parseInt(formData.get("quantity") || "1", 10));

  const cart = getCart();
  const existingIndex = cart.findIndex(
    (item) => item.product_id === productId && item.size === size
  );
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ product_id: productId, size, quantity });
  }

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/shop?added=1`);
  response.cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
