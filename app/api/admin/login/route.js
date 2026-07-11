import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const password = formData.get("password") || "";

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/login?error=1`);
  }

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin`);
  response.cookies.set("mtc_admin", process.env.ADMIN_SESSION_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
