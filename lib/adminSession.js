import { cookies } from "next/headers";

export function isAdminLoggedIn() {
  const cookieStore = cookies();
  return cookieStore.get("mtc_admin")?.value === process.env.ADMIN_SESSION_SECRET;
}
