-- Run this in Supabase: Project > SQL Editor > New Query > paste > Run

create table if not exists runners (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  name text,
  avatar_url text,
  access_token text not null,
  refresh_token text not null,
  token_expires_at bigint not null,
  created_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  strava_activity_id bigint unique not null,
  runner_id uuid references runners(id) on delete cascade,
  distance_m numeric not null,
  moving_time_s integer not null,
  elevation_gain_m numeric default 0,
  sport_type text,
  started_at timestamptz not null,
  created_at timestamptz default now()
);

-- raw inbound Strava webhook events, processed by the cron job
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,
  object_id bigint not null,
  aspect_type text not null,
  owner_id bigint not null,
  raw jsonb not null,
  processed boolean default false,
  created_at timestamptz default now()
);

-- one row per calendar month challenge window, so you can reset rankings monthly
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);

-- fast leaderboard read: total distance per runner within a challenge window
create or replace view leaderboard as
select
  r.id as runner_id,
  r.name,
  r.avatar_url,
  sum(a.distance_m) as total_distance_m,
  count(a.id) as activity_count
from runners r
join activities a on a.runner_id = r.id
group by r.id, r.name, r.avatar_url
order by total_distance_m desc;
