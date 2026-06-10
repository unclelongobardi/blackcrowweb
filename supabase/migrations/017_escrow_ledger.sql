-- Escrow audit ledger + unique deposit tx on bounties.

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
create index if not exists idx_escrow_transactions_kind on escrow_transactions(kind);

-- Prevent reusing the same on-chain tx for multiple bounty deposits.
create unique index if not exists idx_bounties_deposit_tx_unique
  on bounties (deposit_tx) where deposit_tx is not null;
