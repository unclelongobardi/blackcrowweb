-- Data-integrity audit for July 18, 2026.
-- Official seeded rewards are targets, not funded on-chain deposits. Keep them
-- non-claimable until the configured escrow wallet receives real deposits.

update bounties
set
  status = 'funding',
  deposit_tx = null,
  funded_at = null,
  description = regexp_replace(
    description,
    'Use the linked YES price below\.$',
    'Linked odds refresh live. Target reward is pending on-chain escrow funding.'
  )
where is_official = true
  and status in ('open', 'assigned', 'submitted')
  and deposit_tx !~ '^[1-9A-HJ-NP-Za-km-z]{80,90}$';

-- Keep the stored reward score aligned with the calculation used by the API.
update bounties
set reward_influence = least(
  500,
  round(reward_sol_lamports::numeric / 1000000000 * 10)
)::integer;

-- Remove unused stale cache entries. Referenced markets are preserved and
-- refreshed on demand by their feed, operation, or bounty endpoints.
delete from markets m
where (m.last_synced < now() - interval '24 hours' or m.end_date <= now())
  and not exists (select 1 from bounties b where b.market_id = m.id)
  and not exists (select 1 from posts p where p.market_id = m.id)
  and not exists (select 1 from operations o where o.market_id = m.id);
