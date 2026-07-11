import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "../../../../../lib/strava";
import { supabaseAdmin } from "../../../../../lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?connect=denied`);
  }

  const tokenData = await exchangeCodeForToken(code);
  const { athlete, access_token, refresh_token, expires_at } = tokenData;

  const supabase = supabaseAdmin();
  const { data: runner, error: upsertError } = await supabase
    .from("runners")
    .upsert(
      {
        strava_athlete_id: athlete.id,
        name: `${athlete.firstname ?? ""} ${athlete.lastname ?? ""}`.trim(),
        avatar_url: athlete.profile,
        access_token,
        refresh_token,
        token_expires_at: expires_at,
      },
      { onConflict: "strava_athlete_id" }
    )
    .select()
    .single();

  if (upsertError) throw upsertError;

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile`);
  response.cookies.set("gotribe_runner_id", runner.id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
