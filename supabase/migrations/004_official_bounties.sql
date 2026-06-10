-- Official BlackCrow seed bounties (real Polymarket markets, display SOL — escrow simulated).

alter table bounties add column if not exists is_official boolean not null default false;

-- Official BlackCrow profile
insert into profiles (id, privy_did, codename, display_name, bio, avatar_seed, influence, is_onboarded, wallet_address)
values (
  '00000000-0000-0000-0000-0000000000bc',
  'seed:blackcrow_official',
  'blackcrow_official',
  'BlackCrow',
  'Official bounties from the nest. Real Polymarket targets. SOL rewards held in escrow.',
  'blackcrow_official',
  10000,
  true,
  'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH'
) on conflict (privy_did) do update set
  codename = excluded.codename,
  display_name = excluded.display_name,
  bio = excluded.bio;

-- Live Polymarket markets (synced Jun 9 2026)
insert into markets (id, slug, question, category, yes_price, no_price, volume, end_date, url, last_synced) values
  (
    '2475650',
    'highest-temperature-in-nyc-on-june-10-2026-76-77f',
    'Will the highest temperature in New York City be between 76-77°F on June 10?',
    'Weather',
    0.14,
    0.86,
    2437,
    '2026-06-11T04:00:00+00',
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
    '2026-10-29T20:00:00+00',
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
    '2026-06-10T04:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-nyc-on-june-9-2026/highest-temperature-in-nyc-on-june-9-2026-82-83f',
    now()
  )
on conflict (id) do update set
  question = excluded.question,
  yes_price = excluded.yes_price,
  no_price = excluded.no_price,
  volume = excluded.volume,
  end_date = excluded.end_date,
  url = excluded.url,
  last_synced = now();

insert into bounties (
  id, created_by, market_id, title, description, task,
  reward_sol_lamports, reward_influence, kind, status,
  deposit_tx, creator_wallet, is_official, funded_at, expires_at
) values
  (
    'bc000001-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000bc',
    '2475650',
    'KLGA field op — June 10 · 76–77°F YES',
    'Official BLACKCROW · Polymarket weather · YES ~14% · ~$2.4k volume · resolves on Wunderground KLGA daily high for June 10.',
    'Be on-site at LaGuardia (KLGA) before the June 10 daily high is recorded. Submit a timestamped photo or short video showing the station area and your location. If you trade, note your YES position on the 76–77°F bucket. Proof must include date, time, and place.',
    1250000000,
    125,
    'action',
    'open',
    '4k8BmN2xR9pQ7vW3yH6jL1cF5tD0aE8uI6oP3sK7mN2bV9xZ1wQ4rT7yU0hG3jF5kL8nM1pBcRowOfficial001',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-11T04:00:00+00'
  ),
  (
    'bc000002-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000bc',
    '1439550',
    'Bearish Fed-cut push — October 2026 FOMC',
    'Official BLACKCROW · Fed cut by Oct ''26 meeting · YES ~14% · ~$51k volume · macro book worth a coordinated NO-side narrative.',
    'Post 3+ original threads on Home tagging this market with a bearish thesis (data, charts, or catalysts). Get 2+ operators to engage or coordinate NO positioning. Submit links to your posts plus screenshots of reach or replies. One cohesive campaign — not copy-paste spam.',
    850000000,
    85,
    'coord',
    'open',
    '5nM2bV9xZ1wQ4rT7yU0hG3jF5kL8nM1pBcRowOfficial0028BmN2xR9pQ7vW3yH6jL1cF5tD0aE8uI6oP3',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-10-29T20:00:00+00'
  ),
  (
    'bc000003-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-0000000000bc',
    '2467255',
    'KLGA intel — June 9 high reading',
    'Official BLACKCROW · June 9 NYC 82–83°F bucket · resolves on Wunderground KLGA · same-day capture window.',
    'Within 30 minutes of the KLGA daily high posting on Wunderground: (1) screenshot the KLGA daily-high page with visible date/time, (2) photo of the airport station area. Submit both images. Goal: timestamp the reading so the cabal can time Polymarket entries on the 82–83°F market.',
    500000000,
    50,
    'intel',
    'open',
    '6oP3sK7mN2bV9xZ1wQ4rT7yU0hG3jF5kL8nM1pBcRowOfficial0034k8BmN2xR9pQ7vW3yH6jL1cF5tD0aE',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-10T04:00:00+00'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  task = excluded.task,
  reward_sol_lamports = excluded.reward_sol_lamports,
  expires_at = excluded.expires_at,
  status = excluded.status,
  deposit_tx = excluded.deposit_tx,
  is_official = true,
  funded_at = excluded.funded_at;
