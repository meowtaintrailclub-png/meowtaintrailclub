# Go-Tribe Starter — Strava-connected monthly leaderboard

A minimal but real version of the platform we scoped: runners connect Strava,
their activities sync in automatically, and everyone (not just top 100)
shows up ranked on one leaderboard page. Runs entirely on free tiers.

## Stack (all free tier)
- **Vercel** — hosts the Next.js app + API routes
- **Supabase** — free Postgres database
- **Strava API** — OAuth + activity webhook

## 1. Create your Strava API application
1. Go to https://www.strava.com/settings/api
2. Fill in an app name (e.g. "Go-Tribe"), any category, and for
   "Authorization Callback Domain" put your future domain, e.g. `gotribe.vercel.app`
   (you can use `localhost` while testing locally, then update this later)
3. Copy the **Client ID** and **Client Secret** — you'll need these below.

## 2. Create your Supabase project
1. Go to https://app.supabase.com → New Project (free tier)
2. Once created, open **SQL Editor → New query**, paste the contents of
   `schema.sql` from this project, and run it. This creates all your tables.
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## 3. Set your environment variables
Copy `.env.example` to `.env.local` and fill in the Strava + Supabase values
from steps 1–2. Make up your own random strings for `STRAVA_VERIFY_TOKEN`
and `CRON_SECRET` (any long random text works).

## 4. Run it locally to test
```
npm install
npm run dev
```
Visit http://localhost:3000, click "Connect with Strava", authorize, and
confirm you land on `/leaderboard` (it'll be empty until an activity syncs in).

## 5. Deploy to Vercel (free)
1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com → New Project → import that repo.
3. Add all the same environment variables from `.env.local` into
   Vercel's project settings, but set `NEXT_PUBLIC_BASE_URL` to your real
   Vercel URL (e.g. `https://gotribe.vercel.app`).
4. Deploy. Then go back to Strava API settings (step 1) and update the
   Authorization Callback Domain to match your live domain.

## 6. Register your webhook subscription with Strava
This tells Strava to notify your app whenever a connected runner logs an
activity. Run this once from your own machine (replace the values):

```
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://gotribe.vercel.app/api/strava/webhook \
  -F verify_token=YOUR_STRAVA_VERIFY_TOKEN
```
Strava will immediately hit your `/api/strava/webhook` GET endpoint to
verify it, then start sending real events.

## 7. Keep the event processor running
Webhook events land in the `webhook_events` table instantly, but a separate
job has to turn them into leaderboard rows by calling the Strava API.

- `vercel.json` schedules this every 5 minutes, but Vercel's free Hobby
  plan currently limits cron jobs to once a day. So instead, use a free
  external pinger:
  1. Go to https://cron-job.org (free) → create an account
  2. Add a new cron job hitting:
     `https://gotribe.vercel.app/api/cron/process-events`
     every 5 minutes, with header `Authorization: Bearer YOUR_CRON_SECRET`
- This is the only "extra free tool" needed — everything else lives on
  Vercel + Supabase.

## What this gives you today
- Unlimited runners on one leaderboard (no Strava 100-person cap)
- Automatic sync — no manual file upload, unlike the RunSignup route
- Monthly reset: just filter `activities.started_at` by date range, or
  add a UI to pick a `challenges` row (table's already there for this)


## What to build next (in rough order)
1. Add a challenge picker so `/leaderboard` filters by the active month
2. Add categories/distance tiers per challenge
3. Swap the plain HTML table for a styled leaderboard UI (podium for top 3, etc.)
4. Add registration + optional paid tiers (Billplz FPX for Malaysian FPX payments)
5. Garmin support: Garmin's API requires a developer partnership approval,
   so for now Garmin/Suunto users just need Strava installed as their
   sync hub (most already have this) — no extra work needed on your side.
