import { NextResponse } from "next/server";
import { getCart, CART_COOKIE_NAME } from "../../../../lib/cart";

export async function POST(request) {
  const formData = await request.formData();
  const productId = formData.get("product_id");
  const variantId = formData.get("variant_id") || null;
  const size = formData.get("size") || null;

  const cart = getCart().filter((item) =>
    !(item.product_id === productId &&
      (variantId ? item.variant_id === variantId : item.size === size))
  );

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`);
  response.cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
