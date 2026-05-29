-- BLACKCROW — seed data (lore-rich demo). Safe to run multiple times.

-- ── Operatives (NPC crows) ───────────────────────────────────────────────
insert into profiles (id, privy_did, codename, display_name, bio, avatar_seed, influence, is_onboarded) values
  ('11111111-1111-1111-1111-111111111111','seed:insider_crow','insider_crow','The Insider','Whispers move faster than prices.','insider', 9820, true),
  ('22222222-2222-2222-2222-222222222222','seed:silent_oracle','silent_oracle','Silent Oracle','I do not predict. I decide.','oracle', 8730, true),
  ('33333333-3333-3333-3333-333333333333','seed:goblin_mode','goblin_mode','Market Goblin','Narratives are cheap. I buy them in bulk.','goblin', 7410, true),
  ('44444444-4444-4444-4444-444444444444','seed:nightjar','nightjar','Nightjar','Liquidity is a rumor with a wallet.','nightjar', 6190, true),
  ('55555555-5555-5555-5555-555555555555','seed:carrion','carrion','Carrion','I arrive after the panic. Always fed.','carrion', 5320, true),
  ('66666666-6666-6666-6666-666666666666','seed:magpie','magpie','Magpie','Shiny edge? Mine now.','magpie', 4870, true)
on conflict (privy_did) do nothing;

-- ── Cabals (squads) ──────────────────────────────────────────────────────
insert into cabals (id, slug, name, motto, description, emblem_seed, created_by) values
  ('aaaaaaa1-0000-0000-0000-000000000001','the-murder','The Murder','We move as one shadow.','The founding flock. Coordinated pushes on high-volume political markets.','murder','11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa2-0000-0000-0000-000000000002','night-roost','Night Roost','Strike while they sleep.','Off-hours liquidity raids and overnight sentiment engineering.','roost','44444444-4444-4444-4444-444444444444'),
  ('aaaaaaa3-0000-0000-0000-000000000003','feather-cartel','Feather Cartel','Influence is the only currency.','Reputation farmers and narrative dealers. Bounty specialists.','cartel','33333333-3333-3333-3333-333333333333')
on conflict (slug) do nothing;

insert into cabal_members (cabal_id, profile_id, role) values
  ('aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','leader'),
  ('aaaaaaa1-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','operative'),
  ('aaaaaaa1-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555','operative'),
  ('aaaaaaa2-0000-0000-0000-000000000002','44444444-4444-4444-4444-444444444444','leader'),
  ('aaaaaaa2-0000-0000-0000-000000000002','66666666-6666-6666-6666-666666666666','operative'),
  ('aaaaaaa3-0000-0000-0000-000000000003','33333333-3333-3333-3333-333333333333','leader')
on conflict do nothing;

-- ── Placeholder markets (replaced/augmented by live Polymarket sync) ───────
insert into markets (id, slug, question, category, yes_price, no_price, volume, url) values
  ('seed-btc-100k','btc-100k','Will Bitcoin close above $100K this month?','Crypto',0.63,0.37,4200000,'https://polymarket.com'),
  ('seed-fed-cut','fed-rate-cut','Will the Fed cut rates at the next meeting?','Economy',0.42,0.58,3100000,'https://polymarket.com'),
  ('seed-etf','blackrock-etf','Will a new spot ETF be approved this quarter?','Crypto',0.72,0.28,2550000,'https://polymarket.com')
on conflict (id) do nothing;

-- ── Operations (coordinated raids) ────────────────────────────────────────
insert into operations (id, market_id, cabal_id, created_by, title, thesis, target_side, status) values
  ('0e000001-0000-0000-0000-000000000001','seed-btc-100k','aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Push BTC YES past 70%','Coordinated buys + bullish threads before the monthly close. Flood the timeline.','YES','active'),
  ('0e000002-0000-0000-0000-000000000002','seed-fed-cut','aaaaaaa2-0000-0000-0000-000000000002','44444444-4444-4444-4444-444444444444','Fade the rate-cut hopium','Overnight NO accumulation. Seed doubt with macro takes.','NO','active'),
  ('0e000003-0000-0000-0000-000000000003','seed-etf','aaaaaaa3-0000-0000-0000-000000000003','33333333-3333-3333-3333-333333333333','ETF YES narrative farm','Manufacture inevitability. Every reply is a brick.','YES','planning')
on conflict (id) do nothing;

insert into operation_joins (operation_id, profile_id, conviction) values
  ('0e000001-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222',85),
  ('0e000001-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555',70),
  ('0e000002-0000-0000-0000-000000000002','66666666-6666-6666-6666-666666666666',60)
on conflict do nothing;

-- ── War-room posts (debates / feed) ───────────────────────────────────────
insert into posts (id, author_id, market_id, operation_id, content, sentiment) values
  ('b0000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','seed-btc-100k','0e000001-0000-0000-0000-000000000001','Heard something big about the monthly close. We move at the open. Load up or fade.','bullish'),
  ('b0000002-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','seed-fed-cut','0e000002-0000-0000-0000-000000000002','Rate cut is priced on pure hopium. Overnight we seed doubt. Lock it in.','bearish'),
  ('b0000003-0000-0000-0000-000000000003','33333333-3333-3333-3333-333333333333','seed-etf','0e000003-0000-0000-0000-000000000003','Altseason is a narrative. But narratives move millions. Brick by brick.','bullish'),
  ('b0000004-0000-0000-0000-000000000004','44444444-4444-4444-4444-444444444444',null,null,'Reminder: attention is liquidity. If the timeline is loud, the book follows.','neutral')
on conflict (id) do nothing;

insert into post_votes (post_id, profile_id, value) values
  ('b0000001-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222',1),
  ('b0000001-0000-0000-0000-000000000001','33333333-3333-3333-3333-333333333333',1),
  ('b0000002-0000-0000-0000-000000000002','44444444-4444-4444-4444-444444444444',1),
  ('b0000003-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',1)
on conflict do nothing;

-- ── Bounties (rewards) ─────────────────────────────────────────────────────
insert into bounties (id, title, description, reward_influence, kind, status) values
  ('c0000001-0000-0000-0000-000000000001','Recruit 3 operatives','Bring three new crows into the network. Their first operation counts.',500,'referral','open'),
  ('c0000002-0000-0000-0000-000000000002','Author a viral thesis','Post a debate thread that earns 100+ upvotes in 24h.',750,'debate','open'),
  ('c0000003-0000-0000-0000-000000000003','Lead a winning operation','Run an operation that moves its market 5%+ in your direction.',1500,'operation','open'),
  ('c0000004-0000-0000-0000-000000000004','Drop verified intel','Share market-moving intel that the council verifies.',1000,'intel','open')
on conflict (id) do nothing;
