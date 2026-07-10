const STRAVA_API = "https://www.strava.com/api/v3";

export async function exchangeCodeForToken(code) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${await res.text()}`);
  return res.json();
}

export async function refreshAccessToken(refresh_token) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${await res.text()}`);
  return res.json();
}

export async function getValidAccessToken(supabase, runner) {
  const now = Math.floor(Date.now() / 1000);
  if (runner.token_expires_at > now + 60) return runner.access_token;

  const refreshed = await refreshAccessToken(runner.refresh_token);
  await supabase
    .from("runners")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      token_expires_at: refreshed.expires_at,
    })
    .eq("id", runner.id);

  return refreshed.access_token;
}

export async function fetchActivity(accessToken, activityId) {
  const res = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Strava activity fetch failed: ${await res.text()}`);
  return res.json();
}
