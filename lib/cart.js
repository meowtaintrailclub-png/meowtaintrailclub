import { cookies } from "next/headers";

const CART_COOKIE = "mtc_cart";

export function getCart() {
  const cookieStore = cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const CART_COOKIE_NAME = CART_COOKIE;
