import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";
import { getValidAccessToken, fetchActivity } from "../../../../lib/strava";

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data: events } = await supabase
    .from("webhook_events")
    .select("*")
    .eq("processed", false)
    .limit(25);

  let handled = 0;

  for (const event of events ?? []) {
    try {
      if (event.object_type === "activity" && (event.aspect_type === "create" || event.aspect_type === "update")) {
        const { data: runner } = await supabase
          .from("runners")
          .select("*")
          .eq("strava_athlete_id", event.owner_id)
          .single();

        if (runner) {
          const accessToken = await getValidAccessToken(supabase, runner);
          const activity = await fetchActivity(accessToken, event.object_id);

          const isRun = ["Run", "TrailRun"].includes(activity.type ?? activity.sport_type);

          // Only count activities from the day the runner joined, onward.
          const joinDate = new Date(runner.created_at).toISOString().slice(0, 10);
          const activityDate = new Date(activity.start_date).toISOString().slice(0, 10);
          const isAfterJoining = activityDate >= joinDate;

          if (isRun && isAfterJoining) {
            await supabase.from("activities").upsert(
              {
                strava_activity_id: activity.id,
                runner_id: runner.id,
                distance_m: activity.distance,
                moving_time_s: activity.moving_time,
                elevation_gain_m: activity.total_elevation_gain,
                sport_type: activity.sport_type,
                started_at: activity.start_date,
              },
              { onConflict: "strava_activity_id" }
            );
          }
        }
      }

      if (event.object_type === "activity" && event.aspect_type === "delete") {
        await supabase.from("activities").delete().eq("strava_activity_id", event.object_id);
      }

      await supabase.from("webhook_events").update({ processed: true }).eq("id", event.id);
      handled++;
    } catch (err) {
      console.error("Failed processing event", event.id, err);
    }
  }

  return NextResponse.json({ handled });
}
