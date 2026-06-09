-- BLACKCROW — internal social network schema
-- Run this in the Supabase SQL editor (or via the provided sync script).
-- All access happens server-side with the service role key, so RLS is left off.

create extension if not exists "pgcrypto";

-- ───────────────────────────── PROFILES (the Crows) ─────────────────────────
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  privy_did     text unique not null,
  wallet_address text,
  codename      text unique not null,
  display_name  text,
  bio           text,
  avatar_seed   text,
  influence     integer not null default 0,   -- reputation ("Feathers")
  is_onboarded  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ───────────────────────────── CABALS (the squads) ──────────────────────────
create table if not exists cabals (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  motto        text,
  description  text,
  emblem_seed  text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists cabal_members (
  cabal_id   uuid references cabals(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  role       text not null default 'operative',  -- leader | operative
  joined_at  timestamptz not null default now(),
  primary key (cabal_id, profile_id)
);

-- ───────────────────────────── MARKETS (Polymarket cache) ───────────────────
create table if not exists markets (
  id          text primary key,        -- polymarket id
  slug        text,
  question    text not null,
  category    text,
  image       text,
  yes_price   numeric,
  no_price    numeric,
  volume      numeric,
  end_date    timestamptz,
  url         text,
  last_synced timestamptz not null default now()
);

-- ───────────────────────────── OPERATIONS (coordinated raids) ───────────────
create table if not exists operations (
  id          uuid primary key default gen_random_uuid(),
  market_id   text references markets(id) on delete set null,
  cabal_id    uuid references cabals(id) on delete set null,
  created_by  uuid references profiles(id) on delete set null,
  title       text not null,
  thesis      text,
  target_side text not null default 'YES',   -- YES | NO
  status      text not null default 'active',-- planning | active | closed
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists operation_joins (
  operation_id uuid references operations(id) on delete cascade,
  profile_id   uuid references profiles(id) on delete cascade,
  conviction   integer not null default 50,
  joined_at    timestamptz not null default now(),
  primary key (operation_id, profile_id)
);

-- ───────────────────────────── POSTS (war room / debates / feed) ────────────
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references profiles(id) on delete cascade,
  market_id    text references markets(id) on delete set null,
  operation_id uuid references operations(id) on delete set null,
  parent_id    uuid references posts(id) on delete cascade,
  content      text not null,
  sentiment    text default 'neutral',  -- bullish | bearish | neutral
  created_at   timestamptz not null default now()
);

create table if not exists post_votes (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  value      smallint not null,   -- 1 | -1
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

-- ───────────────────────────── FOLLOWS ──────────────────────────────────────
create table if not exists follows (
  follower_id  uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- ───────────────────────────── BOUNTIES (SOL escrow rewards) ────────────────
create table if not exists bounties (
  id                  uuid primary key default gen_random_uuid(),
  created_by          uuid references profiles(id) on delete set null,
  market_id           text references markets(id) on delete set null,
  title               text not null,
  description         text,
  task                text,                    -- what the helper must do
  reward_sol_lamports bigint not null default 0,
  reward_influence    integer not null default 50,
  kind                text not null default 'action', -- action | intel | coord
  status              text not null default 'funding',
  -- funding → open → assigned → submitted → paid | cancelled
  helper_id           uuid references profiles(id) on delete set null,
  proof               text,
  deposit_tx          text,
  payout_tx           text,
  creator_wallet      text,
  helper_wallet       text,
  created_at          timestamptz not null default now(),
  funded_at           timestamptz,
  assigned_at         timestamptz,
  submitted_at        timestamptz,
  paid_at             timestamptz,
  is_official         boolean not null default false
);

-- Bounty indexes applied in supabase/migrations/002_bounty_escrow.sql

-- ───────────────────────────── DIRECT MESSAGES ──────────────────────────────
create table if not exists dm_conversations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dm_participants (
  conversation_id uuid references dm_conversations(id) on delete cascade,
  profile_id      uuid references profiles(id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, profile_id)
);

create table if not exists dm_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references dm_conversations(id) on delete cascade,
  sender_id       uuid references profiles(id) on delete set null,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_dm_messages_conv on dm_messages(conversation_id, created_at desc);
create index if not exists idx_dm_participants_profile on dm_participants(profile_id);

-- ───────────────────────────── NOTIFICATIONS ────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  type       text not null,
  body       text,
  link       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────────────────────────── PRESENCE (live online counter) ───────────────
create table if not exists presence (
  session_id text primary key,
  last_seen  timestamptz not null default now()
);
create index if not exists idx_presence_last_seen on presence(last_seen);

-- ───────────────────────────── INDEXES ──────────────────────────────────────
create index if not exists idx_posts_created    on posts(created_at desc);
create index if not exists idx_posts_market     on posts(market_id);
create index if not exists idx_posts_operation  on posts(operation_id);
create index if not exists idx_posts_parent     on posts(parent_id);
create index if not exists idx_operations_status on operations(status);
create index if not exists idx_profiles_influence on profiles(influence desc);
create index if not exists idx_cabal_members_profile on cabal_members(profile_id);
create index if not exists idx_notifications_profile on notifications(profile_id, read);
