import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

// Strava calls this once, when you register the webhook subscription,
// to prove you own the endpoint.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }
  return NextResponse.json({ error: "verification failed" }, { status: 403 });
}

// Strava calls this every time an athlete creates/updates/deletes an activity.
// Strava requires a 200 response within 2 seconds, so we just record the event
// and let the cron job in /api/cron/process-events do the actual Strava API work.
export async function POST(request) {
  const body = await request.json();
  const supabase = supabaseAdmin();

  await supabase.from("webhook_events").insert({
    object_type: body.object_type,
    object_id: body.object_id,
    aspect_type: body.aspect_type,
    owner_id: body.owner_id,
    raw: body,
  });

  return NextResponse.json({ received: true });
}
