-- GLORIA — internal social network schema
-- Run this in the Supabase SQL editor (or via the provided sync script).
-- All access happens server-side with the service role key, so RLS is left off.

create extension if not exists "pgcrypto";

-- ───────────────────────────── PROFILES (operators) ─────────────────────────
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  privy_did     text unique not null,
  wallet_address text,
  codename      text unique not null,
  display_name  text,
  bio           text,
  avatar_seed   text,
  influence     integer not null default 0,   -- reputation (GLORIA score)
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
  cabal_id     uuid references cabals(id) on delete set null,
  bounty_id    uuid references bounties(id) on delete set null,
  parent_id    uuid references posts(id) on delete cascade,
  content      text not null,
  sentiment    text default 'neutral',  -- bullish | bearish | neutral
  image_url    text,
  kind         text not null default 'post',
  created_at   timestamptz not null default now()
);

create table if not exists post_polls (
  post_id uuid primary key references posts(id) on delete cascade,
  options jsonb not null
);

create table if not exists post_poll_votes (
  post_id uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  option_index smallint not null,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists post_votes (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  value      smallint not null,   -- 1 | -1
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists post_reposts (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists post_bookmarks (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists post_views (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
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
  is_official         boolean not null default false,
  creator_base_lamports bigint,
  expires_at          timestamptz,
  collection          text
);

create table if not exists bounty_participants (
  id             uuid primary key default gen_random_uuid(),
  bounty_id      uuid not null references bounties(id) on delete cascade,
  profile_id     uuid not null references profiles(id) on delete cascade,
  wallet_address text,
  status         text not null default 'accepted',
  proof_text     text,
  proof_media    jsonb not null default '[]'::jsonb,
  submitted_at   timestamptz,
  reviewed_at    timestamptz,
  payout_tx      text,
  joined_at      timestamptz not null default now(),
  unique (bounty_id, profile_id)
);

create index if not exists idx_bounty_participants_bounty on bounty_participants(bounty_id);

create table if not exists bounty_contributions (
  id           uuid primary key default gen_random_uuid(),
  bounty_id    uuid not null references bounties(id) on delete cascade,
  profile_id   uuid references profiles(id) on delete set null,
  lamports     bigint not null,
  tx_signature text not null unique,
  created_at   timestamptz not null default now()
);

create index if not exists idx_bounty_contributions_bounty on bounty_contributions(bounty_id, created_at desc);

create table if not exists escrow_transactions (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid references bounties(id) on delete set null,
  kind text not null check (kind in ('deposit', 'contribution', 'payout', 'refund')),
  tx_signature text not null unique,
  from_wallet text,
  to_wallet text,
  lamports bigint not null,
  profile_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_escrow_transactions_bounty on escrow_transactions(bounty_id, created_at desc);

-- API rate limit buckets (serverless-safe via Postgres)
create table if not exists api_rate_limits (
  bucket text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create index if not exists idx_api_rate_limits_reset_at on api_rate_limits (reset_at);

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

create table if not exists schema_migrations (
  name       text primary key,
  applied_at timestamptz not null default now()
);
create index if not exists idx_operations_status on operations(status);
create index if not exists idx_profiles_influence on profiles(influence desc);
create index if not exists idx_cabal_members_profile on cabal_members(profile_id);
create index if not exists idx_notifications_profile on notifications(profile_id, read);
