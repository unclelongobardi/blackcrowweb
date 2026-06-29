-- Replace World Cup bounties with thin-book official ops (realistic SOL, manipulable markets).

-- Remove World Cup jobs (preserve paid history).
delete from bounty_participants
where bounty_id in (select id from bounties where collection = 'world_cup' and status <> 'paid');

delete from bounty_contributions
where bounty_id in (select id from bounties where collection = 'world_cup' and status <> 'paid');

update posts set bounty_id = null
where bounty_id in (select id from bounties where collection = 'world_cup' and status <> 'paid');

delete from escrow_transactions
where bounty_id in (select id from bounties where collection = 'world_cup' and status <> 'paid');

delete from bounties
where collection = 'world_cup' and status <> 'paid';

-- ── Thin markets (Polymarket Gamma, Jun 2026) ───────────────────────────────

insert into markets (id, slug, question, category, yes_price, no_price, volume, end_date, url, last_synced) values
  (
    '2537856',
    'highest-temperature-in-nyc-on-june-15-2026-76-77f',
    'Will the highest temperature in New York City be between 76-77°F on June 15?',
    'Weather',
    0.215,
    0.785,
    106,
    '2026-06-15T12:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-nyc-on-june-15-2026/highest-temperature-in-nyc-on-june-15-2026-76-77f',
    now()
  ),
  (
    '2537857',
    'highest-temperature-in-nyc-on-june-15-2026-78-79f',
    'Will the highest temperature in New York City be between 78-79°F on June 15?',
    'Weather',
    0.35,
    0.65,
    245,
    '2026-06-15T12:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-nyc-on-june-15-2026/highest-temperature-in-nyc-on-june-15-2026-78-79f',
    now()
  ),
  (
    '2537902',
    'highest-temperature-in-chicago-on-june-15-2026-76-77f',
    'Will the highest temperature in Chicago be between 76-77°F on June 15?',
    'Weather',
    0.305,
    0.695,
    168,
    '2026-06-15T12:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-chicago-on-june-15-2026/highest-temperature-in-chicago-on-june-15-2026-76-77f',
    now()
  ),
  (
    '2537901',
    'highest-temperature-in-chicago-on-june-15-2026-74-75f',
    'Will the highest temperature in Chicago be between 74-75°F on June 15?',
    'Weather',
    0.23,
    0.77,
    308,
    '2026-06-15T12:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-chicago-on-june-15-2026/highest-temperature-in-chicago-on-june-15-2026-74-75f',
    now()
  ),
  (
    '2513939',
    'highest-temperature-in-hong-kong-on-june-14-2026-30c',
    'Will the highest temperature in Hong Kong be 30°C on June 14?',
    'Weather',
    0.53,
    0.47,
    8424,
    '2026-06-14T12:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-hong-kong-on-june-14-2026/highest-temperature-in-hong-kong-on-june-14-2026-30c',
    now()
  ),
  (
    '2513938',
    'highest-temperature-in-hong-kong-on-june-14-2026-29c',
    'Will the highest temperature in Hong Kong be 29°C on June 14?',
    'Weather',
    0.305,
    0.695,
    18246,
    '2026-06-14T12:00:00+00',
    'https://polymarket.com/event/highest-temperature-in-hong-kong-on-june-14-2026/highest-temperature-in-hong-kong-on-june-14-2026-29c',
    now()
  ),
  (
    '2462761',
    'solana-above-70-on-june-14-2026',
    'Will the price of Solana be above $70 on June 14?',
    'Crypto',
    0.13,
    0.87,
    303,
    '2026-06-14T16:00:00+00',
    'https://polymarket.com/event/solana-above-on-june-14-2026/solana-above-70-on-june-14-2026',
    now()
  ),
  (
    '2471139',
    'solana-above-80-on-june-15-2026',
    'Will the price of Solana be above $80 on June 15?',
    'Crypto',
    0.0065,
    0.9935,
    222,
    '2026-06-15T16:00:00+00',
    'https://polymarket.com/event/solana-above-on-june-15-2026/solana-above-80-on-june-15-2026',
    now()
  ),
  (
    '2506149',
    'will-the-announcers-say-eye-poke-during-ufc-250-20260610175532910',
    'Will the announcers say "Eye poke" during UFC 250?',
    'Sports',
    0.465,
    0.535,
    13,
    '2026-06-15T03:59:00+00',
    'https://polymarket.com/event/what-will-the-announcers-say-during-ufc-freedom-250-20260611140014483/will-the-announcers-say-eye-poke-during-ufc-250-20260610175532910',
    now()
  ),
  (
    '2506141',
    'will-the-announcers-say-armbar-or-arm-bar-during-ufc-250-20260610181552154',
    'Will the announcers say "Armbar" or "Arm Bar" during UFC 250?',
    'Sports',
    0.475,
    0.525,
    0,
    '2026-06-15T03:59:00+00',
    'https://polymarket.com/event/what-will-the-announcers-say-during-ufc-freedom-250-20260611140014483/will-the-announcers-say-armbar-or-arm-bar-during-ufc-250-20260610181552154',
    now()
  )
on conflict (id) do update set
  question = excluded.question,
  yes_price = excluded.yes_price,
  no_price = excluded.no_price,
  volume = excluded.volume,
  end_date = excluded.end_date,
  url = excluded.url,
  category = excluded.category,
  last_synced = now();

-- Refresh legacy official bounties (VALORE copy, current thin targets).
update bounties set
  market_id = '2537856',
  title = 'KLGA field op — June 15 · 76–77°F YES',
  description = 'Official VALORE · NYC daily weather · YES ~22% · ~$106 volume · resolves on Wunderground KLGA — a book one operator can move.',
  task = 'Be on-site at LaGuardia (KLGA) before the June 15 daily high is recorded. Submit a timestamped photo or short video at the station. If you trade, note your YES size on the 76–77°F bucket. Proof must include date, time, and place.',
  reward_sol_lamports = 1250000000,
  reward_influence = 125,
  kind = 'action',
  collection = 'thin_book',
  expires_at = '2026-06-15T12:00:00+00',
  status = case when status = 'paid' then status else 'open' end
where id = 'bc000001-0000-0000-0000-000000000001';

update bounties set
  title = 'Bearish Fed-cut push — October 2026 FOMC',
  description = 'Official VALORE · Fed cut by Oct ''26 · YES ~14% · narrative coord on a contested macro lane (not a pure arb play).',
  task = 'Post 3+ original threads on Home tagging this market with a bearish thesis (data, charts, or catalysts). Rally 2+ operators to engage or coordinate NO positioning. Submit links plus screenshots of reach. One cohesive campaign — not spam.',
  collection = 'thin_book',
  status = case when status = 'paid' then status else 'open' end
where id = 'bc000002-0000-0000-0000-000000000002';

update bounties set
  market_id = '2537857',
  title = 'KLGA intel — June 15 high reading',
  description = 'Official VALORE · NYC 78–79°F bucket · YES ~35% · ~$245 volume · same-day capture window on KLGA.',
  task = 'Within 30 minutes of the KLGA daily high posting on Wunderground: (1) screenshot the KLGA daily-high page with visible date/time, (2) photo of the airport station area. Submit both. Goal: timestamp the reading so the cabal can time entries on this thin bucket.',
  reward_sol_lamports = 500000000,
  reward_influence = 50,
  kind = 'intel',
  collection = 'thin_book',
  expires_at = '2026-06-15T12:00:00+00',
  status = case when status = 'paid' then status else 'open' end
where id = 'bc000003-0000-0000-0000-000000000003';

-- ── New thin-book official bounties (0.3–0.9 SOL) ───────────────────────────

insert into bounties (
  id, created_by, market_id, title, description, task,
  reward_sol_lamports, reward_influence, kind, status,
  deposit_tx, creator_wallet, is_official, funded_at, expires_at, collection
) values
  (
    'bc000014-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-0000000000bc',
    '2513939',
    'Hong Kong — 30°C bucket push',
    'Official VALORE · HK daily high 30°C · YES ~53% · ~$8.4k volume · contested weather book.',
    'Track HKO + regional model runs for June 14. Post 2 intel threads on Home before noon HKT with your bucket thesis. If on-site, submit a timestamped rooftop or harbour photo with ambient context. Tag this market in every post.',
    900000000,
    90,
    'coord',
    'open',
    'VxRow014Hk30c90SolThinBookOfficialWeatherPush2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-14T12:00:00+00',
    'thin_book'
  ),
  (
    'bc000015-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-0000000000bc',
    '2537902',
    'ORD field op — June 15 · 76–77°F',
    'Official VALORE · Chicago O''Hare daily high · YES ~31% · ~$168 volume · ultra-thin Midwest weather book.',
    'On-site at O''Hare (ORD) before the June 15 daily high posts. Submit timestamped photo/video at the observation area plus a one-paragraph read on wind/cloud cover. Note any YES position size — this book moves on single-digit dollars.',
    750000000,
    75,
    'action',
    'open',
    'VxRow015Ord75SolChicago7677ThinBookField2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-15T12:00:00+00',
    'thin_book'
  ),
  (
    'bc000016-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-0000000000bc',
    '2537901',
    'ORD intel — June 15 · 74–75°F lane',
    'Official VALORE · Chicago 74–75°F bucket · YES ~23% · ~$308 volume · alternate thin lane on same event.',
    'Publish a pre-dawn model brief on Home tagging this market (NAM/GFS skew vs prior day). At resolution window, screenshot Wunderground ORD daily high within 20 minutes of publish. Submit links + images.',
    650000000,
    65,
    'intel',
    'open',
    'VxRow016Ord65SolChicago7475IntelThin2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-15T12:00:00+00',
    'thin_book'
  ),
  (
    'bc000017-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-0000000000bc',
    '2462761',
    'SOL $70 — micro-cap coord',
    'Official VALORE · SOL above $70 on June 14 · YES ~13% · ~$303 volume · crypto daily strike you can nudge.',
    'Run a 24h coord push: 3+ Home threads with on-chain flow screenshots, perp funding, and exchange tape tagging this market. Rally 2 operators to post aligned takes or small YES clips. Submit thread links + wallet proof if you traded.',
    550000000,
    55,
    'coord',
    'open',
    'VxRow017Sol70_55SolMicroCapCoordThin2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-14T16:00:00+00',
    'thin_book'
  ),
  (
    'bc000018-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-0000000000bc',
    '2506149',
    'UFC 250 broadcast — "Eye poke" lane',
    'Official VALORE · Announcers say "Eye poke" on CBS/Paramount+ · YES ~47% · ~$13 volume · mention micro-book.',
    'Watch-party op during UFC Freedom 250: coordinate 5+ people to react loudly if a foul sequence develops (legal crowd behavior). Capture timestamped clip if the word hits. Post 1 pre-fight Home thread tagging this market with your trigger plan.',
    450000000,
    45,
    'action',
    'open',
    'VxRow018UfcEyePoke45SolMentionThin2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-15T03:59:00+00',
    'thin_book'
  ),
  (
    'bc000019-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-0000000000bc',
    '2506141',
    'UFC 250 broadcast — "Armbar" mention',
    'Official VALORE · Announcers say "Armbar" on English feed · YES ~48% · near-zero volume · pure mention book.',
    'Scout the card for submission-heavy matchups. Live-post 2 timestamped Home updates during the broadcast if grappling heats up, each tagging this market. Submit clip proof if "Armbar" is said on the official feed.',
    400000000,
    40,
    'intel',
    'open',
    'VxRow019UfcArmbar40SolMentionIntel2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-15T03:59:00+00',
    'thin_book'
  ),
  (
    'bc000020-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-0000000000bc',
    '2513938',
    'Hong Kong — 29°C contrarian intel',
    'Official VALORE · HK daily high 29°C · YES ~31% · ~$18k volume · adjacent bucket to the 30°C lead.',
    'Build a contrarian case for the 29°C bin: cross-check airport vs urban station readings, sea breeze timing, and cloud decks. Publish a single deep intel thread on Home with charts; update once before resolution. Tag this market.',
    350000000,
    35,
    'intel',
    'open',
    'VxRow020Hk29c35SolContrarianIntel2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-14T12:00:00+00',
    'thin_book'
  ),
  (
    'bc000021-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-0000000000bc',
    '2471139',
    'SOL $80 — lottery YES clip',
    'Official VALORE · SOL above $80 on June 15 · YES ~0.7% · ~$222 volume · tail strike, small size can reprice.',
    'Document a disciplined tail trade: entry screenshot, size, and thesis for why vol could spike into resolution. Post on Home tagging this market. Proof = trade screenshots + short write-up (no financial advice — ops journal only).',
    300000000,
    30,
    'action',
    'open',
    'VxRow021Sol80_30SolTailClipThin2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH',
    true,
    now(),
    '2026-06-15T16:00:00+00',
    'thin_book'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  task = excluded.task,
  reward_sol_lamports = excluded.reward_sol_lamports,
  reward_influence = excluded.reward_influence,
  kind = excluded.kind,
  market_id = excluded.market_id,
  expires_at = excluded.expires_at,
  collection = excluded.collection,
  deposit_tx = excluded.deposit_tx,
  is_official = true,
  status = case when bounties.status = 'paid' then bounties.status else excluded.status end;
