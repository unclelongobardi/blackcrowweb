-- Official BlackCrow seed bounties (real Polymarket markets, display SOL — escrow simulated).

alter table bounties add column if not exists is_official boolean not null default false;

-- Official BlackCrow profile
insert into profiles (id, privy_did, codename, display_name, bio, avatar_seed, influence, is_onboarded, wallet_address)
values (
  '00000000-0000-0000-0000-0000000000bc',
  'seed:blackcrow_official',
  'blackcrow',
  'BlackCrow',
  'Official bounties from the nest. Real Polymarket targets. SOL rewards held in escrow.',
  'blackcrow',
  10000,
  true,
  'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH'
) on conflict (privy_did) do update set
  codename = excluded.codename,
  display_name = excluded.display_name,
  bio = excluded.bio;

-- Live Polymarket markets (synced Jun 9 2026)
insert into markets (id, slug, question, category, yes_price, no_price, volume, url, last_synced) values
  (
    '2475650',
    'highest-temperature-in-nyc-on-june-10-2026-76-77f',
    'Will the highest temperature in New York City be between 76-77°F on June 10?',
    'Weather',
    0.14,
    0.86,
    2437,
    'https://polymarket.com/event/highest-temperature-in-nyc-on-june-10-2026/highest-temperature-in-nyc-on-june-10-2026-76-77f',
    now()
  ),
  (
    '1439550',
    'fed-rate-cut-by-october-2026-meeting-199-747',
    'Fed rate cut by October 2026 meeting?',
    'Economy',
    0.1395,
    0.8605,
    51132,
    'https://polymarket.com/event/fed-rate-cut-by-629/fed-rate-cut-by-october-2026-meeting-199-747',
    now()
  ),
  (
    '2467255',
    'highest-temperature-in-nyc-on-june-9-2026-82-83f',
    'Will the highest temperature in New York City be between 82-83°F on June 9?',
    'Weather',
    0.0055,
    0.9945,
    13958,
    'https://polymarket.com/event/highest-temperature-in-nyc-on-june-9-2026/highest-temperature-in-nyc-on-june-9-2026-82-83f',
    now()
  )
on conflict (id) do update set
  question = excluded.question,
  yes_price = excluded.yes_price,
  no_price = excluded.no_price,
  volume = excluded.volume,
  url = excluded.url,
  last_synced = now();

insert into bounties (
  id, created_by, market_id, title, description, task,
  reward_sol_lamports, reward_influence, kind, status,
  deposit_tx, creator_wallet, is_official, funded_at
) values
  (
    'bc000001-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000bc',
    '2475650',
    'Heat the LaGuardia thermometer',
    'BlackCrow bounty · Thin weather book on Polymarket. Push the June 10 NYC high-temp bucket with field ops.',
    'Go to the LaGuardia Airport (KLGA) weather station area. Use a heat source (hair dryer works) near the official sensor before the daily high is recorded. Bet YES on the 76-77°F bucket on Polymarket. Post photo + timestamp proof.',
    1250000000,
    125,
    'action',
    'open',
    '4k8BmN2xR9pQ7vW3yH6jL1cF5tD0aE8uI6oP3sK7mN2bV9xZ1wQ4rT7yU0hG3jF5kL8nM1pBcRowOfficial001',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now()
  ),
  (
    'bc000002-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000bc',
    '1439550',
    'Seed doubt on Fed rate-cut odds',
    'BlackCrow bounty · October 2026 Fed cut market is thin enough to nudge. Coordinate a bearish push.',
    'Post 5 original threads in the War Room arguing against an October Fed cut. Tag the market, include charts or links. Rally 3+ operatives to join an operation on this market.',
    850000000,
    85,
    'coord',
    'open',
    '5nM2bV9xZ1wQ4rT7yU0hG3jF5kL8nM1pBcRowOfficial0028BmN2xR9pQ7vW3yH6jL1cF5tD0aE8uI6oP3',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now()
  ),
  (
    'bc000003-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-0000000000bc',
    '2467255',
    'Document KLGA reading before publish',
    'BlackCrow bounty · NYC June 9 temp market resolves on Wunderground KLGA data. Get there first.',
    'Screenshot the Wunderground KLGA daily high page AND a photo of the airport station area within 30 min of the reading posting. Submit both links. Helps the cabal time their Polymarket entries.',
    500000000,
    50,
    'intel',
    'open',
    '6oP3sK7mN2bV9xZ1wQ4rT7yU0hG3jF5kL8nM1pBcRowOfficial0034k8BmN2xR9pQ7vW3yH6jL1cF5tD0aE',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  task = excluded.task,
  reward_sol_lamports = excluded.reward_sol_lamports,
  status = excluded.status,
  deposit_tx = excluded.deposit_tx,
  is_official = true,
  funded_at = excluded.funded_at;
