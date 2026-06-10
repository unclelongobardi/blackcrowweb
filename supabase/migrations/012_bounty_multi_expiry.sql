-- Multi-participant bounties, proof media, and market-linked expiry.

alter table bounties add column if not exists expires_at timestamptz;

update bounties b
set expires_at = m.end_date
from markets m
where b.market_id = m.id
  and b.expires_at is null
  and m.end_date is not null;

create table if not exists bounty_participants (
  id                  uuid primary key default gen_random_uuid(),
  bounty_id           uuid not null references bounties(id) on delete cascade,
  profile_id          uuid not null references profiles(id) on delete cascade,
  wallet_address      text,
  status              text not null default 'accepted',
  proof_text          text,
  proof_media         jsonb not null default '[]'::jsonb,
  submitted_at        timestamptz,
  reviewed_at         timestamptz,
  payout_tx           text,
  joined_at           timestamptz not null default now(),
  unique (bounty_id, profile_id)
);

create index if not exists idx_bounty_participants_bounty on bounty_participants(bounty_id);
create index if not exists idx_bounties_expires_at on bounties(expires_at);

-- Backfill existing single-helper bounties into participants.
insert into bounty_participants (
  bounty_id, profile_id, wallet_address, status, proof_text, submitted_at, joined_at
)
select
  b.id,
  b.helper_id,
  b.helper_wallet,
  case
    when b.status = 'paid' then 'approved'
    when b.status = 'submitted' then 'submitted'
    when b.status = 'assigned' then 'accepted'
    else 'accepted'
  end,
  b.proof,
  b.submitted_at,
  coalesce(b.assigned_at, b.created_at)
from bounties b
where b.helper_id is not null
on conflict (bounty_id, profile_id) do nothing;
