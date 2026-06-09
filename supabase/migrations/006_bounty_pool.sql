-- Bounty pool: others can add SOL; creator keeps approve/reject authority.

create table if not exists bounty_contributions (
  id           uuid primary key default gen_random_uuid(),
  bounty_id    uuid not null references bounties(id) on delete cascade,
  profile_id   uuid references profiles(id) on delete set null,
  lamports     bigint not null,
  tx_signature text not null unique,
  created_at   timestamptz not null default now()
);

create index if not exists idx_bounty_contributions_bounty on bounty_contributions(bounty_id, created_at desc);

alter table bounties add column if not exists creator_base_lamports bigint;
