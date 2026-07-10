import { NextResponse } from "next/server";

export async function GET() {
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/strava/callback`;
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });
  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`);
}
