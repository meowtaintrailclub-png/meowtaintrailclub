import { cookies } from "next/headers";

export function getLoggedInRunnerId() {
  const cookieStore = cookies();
  return cookieStore.get("gotribe_runner_id")?.value ?? null;
}
