import { NextResponse } from "next/server";

// Visit this URL once in your browser, right after your first deploy, to tell
// Strava where to send activity updates. Replaces having to run a curl command.
// Protected with the same CRON_SECRET so a stranger can't re-point your webhook.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("token") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Wrong or missing token" }, { status: 401 });
  }

  const form = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/strava/webhook`,
    verify_token: process.env.STRAVA_VERIFY_TOKEN,
  });

  const res = await fetch("https://www.strava.com/api/v3/push_subscriptions", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { success: false, message: "Something went wrong - see details below", details: data },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Webhook registered! Strava will now notify your site whenever a connected runner logs an activity.",
    details: data,
  });
}
