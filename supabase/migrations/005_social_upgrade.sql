-- Social upgrade: cabal visibility, DMs, verified profiles, valore rename.

alter table profiles add column if not exists is_verified boolean not null default false;

alter table cabals add column if not exists visibility text not null default 'public';
alter table cabals add column if not exists kind text not null default 'discussion';

create table if not exists cabal_join_requests (
  cabal_id   uuid references cabals(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status     text not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (cabal_id, profile_id)
);

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
create index if not exists idx_cabal_join_requests on cabal_join_requests(cabal_id, status);

-- VALORE official account
update profiles set
  codename = 'valore_official',
  display_name = 'VALORE',
  avatar_seed = 'valore_official',
  is_verified = true,
  bio = 'Official bounties from the network. Real Polymarket targets. SOL rewards in escrow.'
where privy_did = 'seed:valore_official';

update profiles set
  codename = 'valore_official',
  display_name = 'VALORE',
  avatar_seed = 'valore_official',
  is_verified = true
where codename = 'valore' and privy_did like 'seed:%';
