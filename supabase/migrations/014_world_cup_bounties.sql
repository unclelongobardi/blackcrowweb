-- WORLD CUP SPECIAL: 10 official bounties on live Polymarket FIFA 2026 markets.

alter table bounties add column if not exists collection text;

-- ── Markets (Polymarket Gamma IDs, Jun 2026) ────────────────────────────────

insert into markets (id, slug, question, category, yes_price, no_price, volume, end_date, url, last_synced) values
  ('558936', 'will-france-win-the-2026-fifa-world-cup-924', 'Will France win the 2026 FIFA World Cup?', 'Sports', 0.1605, 0.8395, 43136581, '2026-07-20T00:00:00+00', 'https://polymarket.com/event/world-cup-winner/will-france-win-the-2026-fifa-world-cup-924', now()),
  ('839357', 'will-mexico-win-group-a-in-the-2026-fifa-world-cup', 'Will Mexico win Group A in the 2026 FIFA World Cup?', 'Sports', 0.575, 0.425, 229525, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-a-winner/will-mexico-win-group-a-in-the-2026-fifa-world-cup', now()),
  ('839420', 'will-usa-win-group-d-in-the-2026-fifa-world-cup', 'Will USA win Group D in the 2026 FIFA World Cup?', 'Sports', 0.385, 0.615, 89848, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-d-winner/will-usa-win-group-d-in-the-2026-fifa-world-cup', now()),
  ('839359', 'will-south-korea-win-group-a-in-the-2026-fifa-world-cup', 'Will South Korea win Group A in the 2026 FIFA World Cup?', 'Sports', 0.205, 0.795, 77451, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-a-winner/will-south-korea-win-group-a-in-the-2026-fifa-world-cup', now()),
  ('839400', 'will-morocco-win-group-c-in-the-2026-fifa-world-cup', 'Will Morocco win Group C in the 2026 FIFA World Cup?', 'Sports', 0.205, 0.795, 128086, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-c-winner/will-morocco-win-group-c-in-the-2026-fifa-world-cup', now()),
  ('839423', 'will-the-winner-of-kosovoromaniaslovakiatrkiye-playoff-win-group-d-in-the-2026-fifa-world-cup', 'Will Türkiye win Group D in the 2026 FIFA World Cup?', 'Sports', 0.365, 0.635, 158289, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-d-winner/will-the-winner-of-kosovoromaniaslovakiatrkiye-playoff-win-group-d-in-the-2026-fifa-world-cup', now()),
  ('558941', 'will-netherlands-win-the-2026-fifa-world-cup-739', 'Will Netherlands win the 2026 FIFA World Cup?', 'Sports', 0.0405, 0.9595, 37022694, '2026-07-20T00:00:00+00', 'https://polymarket.com/event/world-cup-winner/will-netherlands-win-the-2026-fifa-world-cup-739', now()),
  ('839402', 'will-scotland-win-group-c-in-the-2026-fifa-world-cup', 'Will Scotland win Group C in the 2026 FIFA World Cup?', 'Sports', 0.0795, 0.9205, 208744, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-c-winner/will-scotland-win-group-c-in-the-2026-fifa-world-cup', now()),
  ('558940', 'will-portugal-win-the-2026-fifa-world-cup-912', 'Will Portugal win the 2026 FIFA World Cup?', 'Sports', 0.1055, 0.8945, 37766922, '2026-07-20T00:00:00+00', 'https://polymarket.com/event/world-cup-winner/will-portugal-win-the-2026-fifa-world-cup-912', now()),
  ('839394', 'will-canada-win-group-a-in-the-2026-fifa-world-cup', 'Will Canada win Group B in the 2026 FIFA World Cup?', 'Sports', 0.305, 0.695, 48457, '2026-06-27T00:00:00+00', 'https://polymarket.com/event/world-cup-group-b-winner/will-canada-win-group-a-in-the-2026-fifa-world-cup', now())
on conflict (id) do update set
  question = excluded.question,
  yes_price = excluded.yes_price,
  no_price = excluded.no_price,
  volume = excluded.volume,
  end_date = excluded.end_date,
  url = excluded.url,
  category = excluded.category,
  last_synced = now();

-- ── Bounties (10–100 SOL) ───────────────────────────────────────────────────

insert into bounties (
  id, created_by, market_id, title, description, task,
  reward_sol_lamports, reward_influence, kind, status,
  deposit_tx, creator_wallet, is_official, funded_at, expires_at, collection
) values
  (
    'bc000014-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-0000000000bc',
    '558936',
    'France 2026 — tournament winner push',
    'WORLD CUP SPECIAL · France to win FIFA 2026 · YES ~16% · ~$43M volume · flagship macro book.',
    'Run a 7-day coord campaign on Home: 5+ original threads tagging this market with a France YES thesis (form, depth, knockout path). Rally 3+ operators to post or take YES exposure. Submit links, screenshots, and wallet proof if you traded.',
    100000000000, 500, 'coord', 'open',
    'WcRow014France100SolBcRowOfficialWorldCup2026PushCampaign',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-20T00:00:00+00', 'world_cup'
  ),
  (
    'bc000015-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-0000000000bc',
    '839357',
    'Mexico — win Group A (host nation)',
    'WORLD CUP SPECIAL · Mexico tops Group A · YES ~58% · host-nation narrative book before June 27.',
    'Create fan-zone or watch-party content in Mexico (or diaspora) pushing Group A YES: photo/video with date, city, and crowd. Post 2+ Home threads tagging the market. Note any YES position. Proof = media + post links.',
    90000000000, 500, 'action', 'open',
    'WcRow015Mexico90SolGroupABlackCrowOfficialHostPush',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
  ),
  (
    'bc000016-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-0000000000bc',
    '839420',
    'USA — win Group D (host nation)',
    'WORLD CUP SPECIAL · USA tops Group D · YES ~39% · co-host storyline vs Türkiye & Paraguay.',
    'On-site at a USMNT World Cup watch party or official fan zone. Submit timestamped photo/video + short write-up of the crowd sentiment. Post 1 Home thread tagging Group D YES. Include city and date in proof.',
    80000000000, 500, 'action', 'open',
    'WcRow016USA80SolGroupDHostNationBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
  ),
  (
    'bc000017-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-0000000000bc',
    '839359',
    'South Korea — upset Group A',
    'WORLD CUP SPECIAL · Korea wins Group A · YES ~21% · thin upset lane vs Mexico & Czechia.',
    'Monitor Korean football press, forums, and lineup rumors (English summary required). Post 3 intel drops on Home before Mexico''s first group match, each tagging this market. Submit links + screenshots of source material.',
    70000000000, 500, 'intel', 'open',
    'WcRow017Korea70SolGroupAUpsetIntelBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
  ),
  (
    'bc000018-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-0000000000bc',
    '839400',
    'Morocco — top Group C over Brazil',
    'WORLD CUP SPECIAL · Morocco wins Group C · YES ~21% · Brazil favorite at ~72% — contrarian group play.',
    'Coordinate a 48h narrative push: 4+ Home posts on Morocco''s group path, tag this market, recruit 2 operators in MENA/EU time zones. Submit thread links + engagement screenshots. Bonus: note if you took YES exposure.',
    60000000000, 500, 'coord', 'open',
    'WcRow018Morocco60SolGroupCContrarianBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
  ),
  (
    'bc000019-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-0000000000bc',
    '839423',
    'Türkiye — win Group D',
    'WORLD CUP SPECIAL · Türkiye tops Group D · YES ~37% · three-way heat with USA & Paraguay.',
    'Field intel: photo/video from a Türkiye national-team watch event or training-camp rumor source (public area only). Pair with a 200+ char write-up on why Group D YES is mispriced. Submit media + analysis.',
    50000000000, 500, 'action', 'open',
    'WcRow019Turkiye50SolGroupDFieldIntelBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
  ),
  (
    'bc000020-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-0000000000bc',
    '558941',
    'Netherlands — 2026 dark horse winner',
    'WORLD CUP SPECIAL · Netherlands win FIFA 2026 · YES ~4% · massive longshot book (~$37M vol).',
    'Publish a data-driven dark-horse thread on Home (squad depth, path, xG thesis) tagging this market. Get 2+ operators to reply with substantive takes. Submit links. Goal: move crowd attention before the knockout stage.',
    40000000000, 500, 'coord', 'open',
    'WcRow020Netherlands40SolWinnerLongshotBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-20T00:00:00+00', 'world_cup'
  ),
  (
    'bc000021-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-0000000000bc',
    '839402',
    'Scotland — shock Group C winners',
    'WORLD CUP SPECIAL · Scotland win Group C · YES ~8% · low-priced upset vs Brazil & Morocco.',
    'Before Scotland''s first group match: capture lineup-leak or press-conference intel (screenshots + source URLs). Post 2 Home updates tagging this market as news breaks. Time-sensitive — proof must be dated within 24h of the event.',
    30000000000, 500, 'intel', 'open',
    'WcRow021Scotland30SolGroupCLeakIntelBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
  ),
  (
    'bc000022-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-0000000000bc',
    '558940',
    'Portugal — 2026 winner narrative op',
    'WORLD CUP SPECIAL · Portugal win FIFA 2026 · YES ~11% · Ronaldo-era closing chapter book.',
    'Run a 3-post Home mini-campaign: thesis, rebuttal to skeptics, operator roll-call tagging this market. Include one chart or stat image. Submit all links in one proof bundle.',
    20000000000, 500, 'coord', 'open',
    'WcRow022Portugal20SolWinnerNarrativeBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-20T00:00:00+00', 'world_cup'
  ),
  (
    'bc000023-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-0000000000bc',
    '839394',
    'Canada — win Group B',
    'WORLD CUP SPECIAL · Canada tops Group B · YES ~31% · co-host underdog lane.',
    'Document a Canada fan rally or bar watch-party (photo/video + city/date). Post 1 Home thread tagging Group B YES with your take on Canada''s path. Proof = media + post link.',
    10000000000, 500, 'action', 'open',
    'WcRow023Canada10SolGroupBFanRallyBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-27T00:00:00+00', 'world_cup'
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
  is_official = true,
  status = case when bounties.status = 'paid' then bounties.status else excluded.status end;
