-- Migrate legacy bounties to SOL escrow model (safe to run multiple times).

-- Drop old claim table — replaced by helper_id flow on bounties
drop table if exists bounty_claims;

-- Add new columns if upgrading from old schema
alter table bounties add column if not exists created_by uuid references profiles(id) on delete set null;
alter table bounties add column if not exists market_id text references markets(id) on delete set null;
alter table bounties add column if not exists task text;
alter table bounties add column if not exists reward_sol_lamports bigint not null default 0;
alter table bounties add column if not exists helper_id uuid references profiles(id) on delete set null;
alter table bounties add column if not exists proof text;
alter table bounties add column if not exists deposit_tx text;
alter table bounties add column if not exists payout_tx text;
alter table bounties add column if not exists creator_wallet text;
alter table bounties add column if not exists helper_wallet text;
alter table bounties add column if not exists funded_at timestamptz;
alter table bounties add column if not exists assigned_at timestamptz;
alter table bounties add column if not exists submitted_at timestamptz;
alter table bounties add column if not exists paid_at timestamptz;

-- Reset legacy seed bounties that have no SOL escrow
update bounties set status = 'cancelled'
  where reward_sol_lamports = 0 and status = 'open' and created_by is null;

create index if not exists idx_bounties_status on bounties(status, created_at desc);
create index if not exists idx_bounties_creator on bounties(created_by);
create index if not exists idx_bounties_helper on bounties(helper_id);
