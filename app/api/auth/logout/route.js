import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
  response.cookies.set("gotribe_runner_id", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
