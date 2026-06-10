-- WORLD CUP SPECIAL refresh: secondary / spectacle Polymarket books (Jun 2026).
-- Focus: FOX broadcast mentions, stadium ops, and co-host narrative — not group winners.

insert into markets (id, slug, question, category, yes_price, no_price, volume, end_date, url, last_synced) values
  ('2462936', 'president-trump-to-attend-usa-opening-match-20260607163739001', 'President Trump to Attend USA Opening Match?', 'Sports', 0.13, 0.87, 7635, '2026-07-12T03:59:00+00', 'https://polymarket.com/event/president-trump-to-attend-usa-opening-match-20260607163739001', now()),
  ('2491454', 'will-the-announcers-say-trump-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955332', 'Will the announcers say "Trump" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.485, 0.515, 16, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-trump-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955332', now()),
  ('2491468', 'will-the-announcers-say-mexico-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955346', 'Will the announcers say "Mexico" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.51, 0.49, 37, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-mexico-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955346', now()),
  ('2491469', 'will-the-announcers-say-canada-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955347', 'Will the announcers say "Canada" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.56, 0.44, 76, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-canada-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955347', now()),
  ('2491456', 'will-the-announcers-say-ronaldo-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955334', 'Will the announcers say "Ronaldo" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.5, 0.5, 36, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-ronaldo-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955334', now()),
  ('2491465', 'will-the-announcers-say-legend-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955343', 'Will the announcers say "Legend" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.495, 0.505, 35, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-legend-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955343', now()),
  ('2491458', 'will-the-announcers-say-penalty-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955336', 'Will the announcers say "Penalty" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.58, 0.42, 0, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-penalty-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955336', now()),
  ('2491459', 'will-the-announcers-say-red-card-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955337', 'Will the announcers say "Red Card" during the USA vs Paraguay FIFA World Cup Match?', 'Sports', 0.48, 0.52, 0, '2026-06-13T03:59:00+00', 'https://polymarket.com/event/will-the-announcers-say-red-card-during-the-usa-vs-paraguay-fifa-world-cup-match-20260609202955337', now()),
  ('2470849', 'president-trump-to-attend-world-cup-final-20260608152749044', 'President Trump to Attend World Cup Final?', 'Sports', 0.885, 0.115, 1966, '2026-07-20T03:59:00+00', 'https://polymarket.com/event/president-trump-to-attend-world-cup-final-20260608152749044', now()),
  ('2470848', 'will-trump-be-in-the-wc-champions-photo-20260608152527021', 'Will Trump be in the WC Champions Photo?', 'Sports', 0.33, 0.67, 715, '2026-07-20T03:59:00+00', 'https://polymarket.com/event/will-trump-be-in-the-wc-champions-photo-20260608152527021', now())
on conflict (id) do update set
  question = excluded.question,
  yes_price = excluded.yes_price,
  no_price = excluded.no_price,
  volume = excluded.volume,
  end_date = excluded.end_date,
  url = excluded.url,
  category = excluded.category,
  last_synced = now();

insert into bounties (
  id, created_by, market_id, title, description, task,
  reward_sol_lamports, reward_influence, kind, status,
  deposit_tx, creator_wallet, is_official, funded_at, expires_at, collection
) values
  (
    'bc000014-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-0000000000bc',
    '2462936',
    'Trump at USA opener — visibility push',
    'WORLD CUP SPECIAL · Trump attends USMNT opener vs Paraguay · YES ~13% · SoFi June 12 · spectacle book.',
    'Run a 5-day coord push to flip attendance odds: map motorcade windows, rally 4+ operators to post credible sighting intel on Home, tag this market, and document VIP-rail activity at SoFi (photos from public areas only). Submit thread links + timestamped media.',
    100000000000, 500, 'coord', 'open',
    'WcRow014Trump100SolOpeningSpectacleBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-12T03:59:00+00', 'world_cup'
  ),
  (
    'bc000015-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-0000000000bc',
    '2491454',
    'FOX broadcast — force a "Trump" mention',
    'WORLD CUP SPECIAL · Announcers say "Trump" on FOX English feed · YES ~49% · USA–Paraguay opener · broadcast micro-book.',
    'Stadium op at SoFi during live FOX coverage (kickoff → final whistle): deploy 3+ visible TRUMP signs or a coordinated chant block aimed at the broadcast mics. Proof = clip/screenshot with timestamp + your seat section photo. Post 1 Home thread tagging this market before match day.',
    90000000000, 500, 'action', 'open',
    'WcRow015FoxTrump90SolBroadcastOpBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000016-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-0000000000bc',
    '2491468',
    'FOX broadcast — "Mexico" chant block',
    'WORLD CUP SPECIAL · Announcers say "Mexico" on FOX · YES ~51% · co-host narrative bleed into USA opener.',
    'Organize a 50+ person "México" chant section for the FOX broadcast window. Provide section map, 2 rehearsal timestamps, and match-day video from the stands. Post coord plan on Home tagging this market. Legal crowd behavior only.',
    80000000000, 500, 'coord', 'open',
    'WcRow016FoxMexico80SolChantBlockBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000017-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-0000000000bc',
    '2491469',
    'FOX broadcast — "Canada" co-host signs',
    'WORLD CUP SPECIAL · Announcers say "Canada" on FOX · YES ~56% · tri-host storyline at LA opener.',
    'Deploy maple-leaf / co-host signage in 2+ SoFi sections visible to the main broadcast camera during play. Submit wide-shot photos + a short write-up of placement strategy. Tag this market on Home with your layout sketch.',
    70000000000, 500, 'action', 'open',
    'WcRow017FoxCanada70SolSignageBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000018-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-0000000000bc',
    '2491456',
    'FOX broadcast — "Ronaldo" banner op',
    'WORLD CUP SPECIAL · Announcers say "Ronaldo" on FOX · YES ~50% · thin broadcast mention lane.',
    'Run a CR7 banner wave timed for FOX live segments (pre-arranged 10-banner rotation). Proof = stadium photo set + note which minute windows you targeted. One Home thread tagging this market with operator roll-call.',
    60000000000, 500, 'coord', 'open',
    'WcRow018FoxRonaldo60SolBannerBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000019-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-0000000000bc',
    '2491465',
    'FOX broadcast — "Legend" player tributes',
    'WORLD CUP SPECIAL · Announcers say "Legend" on FOX · YES ~50% · narrative hook for USMNT vets.',
    'Coordinate tribute signs for 2 named USMNT veterans (last name on banner) during live play. Submit photos + a 150-word script of what announcers are likely to pick up. Post on Home tagging this market.',
    50000000000, 500, 'action', 'open',
    'WcRow019FoxLegend50SolTributeBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000020-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-0000000000bc',
    '2491458',
    'FOX broadcast — penalty-box drama watch',
    'WORLD CUP SPECIAL · Announcers say "Penalty" on FOX · YES ~58% · game-event + broadcast book.',
    'Pre-match intel op: scout likely penalty-box flashpoints (set-piece assignments, ref tendencies). Live-post 3 timestamped Home updates during the match tagging this market as drama unfolds. Submit screenshots + clip if "Penalty" hits.',
    40000000000, 500, 'intel', 'open',
    'WcRow020FoxPenalty40SolBoxIntelBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000021-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-0000000000bc',
    '2491459',
    'FOX broadcast — red-card controversy lane',
    'WORLD CUP SPECIAL · Announcers say "Red Card" on FOX · YES ~48% · controversy micro-book.',
    'Monitor ref assignment + foul profile for USA–Paraguay. Publish a pre-match controversy brief on Home, then live-react with 2+ posts if card pressure builds. Proof = analysis links + broadcast capture if "Red Card" is said.',
    30000000000, 500, 'intel', 'open',
    'WcRow021FoxRedCard30SolControversyBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-06-13T03:59:00+00', 'world_cup'
  ),
  (
    'bc000022-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-0000000000bc',
    '2470849',
    'Trump at World Cup Final — motorcade intel',
    'WORLD CUP SPECIAL · Trump attends July 19 final · YES ~89% · MetLife spectacle book.',
    'Build a final-week motorcade + security-perimeter map for MetLife. Post 4 intel drops on Home tagging this market as logistics firm up. Submit dated screenshots from credible local reporting + your synthesis thread.',
    20000000000, 500, 'intel', 'open',
    'WcRow022TrumpFinal20SolMotorcadeBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-20T03:59:00+00', 'world_cup'
  ),
  (
    'bc000023-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-0000000000bc',
    '2470848',
    'Trump in champions photo — podium positioning',
    'WORLD CUP SPECIAL · Trump in winners photo frame · YES ~33% · post-final culture book.',
    'Track protocol for trophy-lift photo lines (who stands where). Publish a positioning diagram + 2 sourced precedents from prior tournaments. Tag this market on Home; update once after the semi-finals with revised odds thesis.',
    10000000000, 500, 'intel', 'open',
    'WcRow023TrumpPhoto10SolPodiumBlackCrow',
    'BcRow7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-20T03:59:00+00', 'world_cup'
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
