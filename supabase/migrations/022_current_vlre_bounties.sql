-- Refresh official VALORE bounties with active markets as of 2026-06-27.
-- Project name: VALORE. Token ticker: $VALORE.

alter table bounties add column if not exists collection text;

-- Detach stale proof/social state from non-paid official slots before reusing them.
delete from bounty_participants
where bounty_id in (
  select id from bounties
  where is_official = true
    and status <> 'paid'
    and id in (
      'bc000001-0000-0000-0000-000000000001',
      'bc000002-0000-0000-0000-000000000002',
      'bc000003-0000-0000-0000-000000000003',
      'bc000014-0000-0000-0000-000000000014',
      'bc000015-0000-0000-0000-000000000015',
      'bc000016-0000-0000-0000-000000000016',
      'bc000017-0000-0000-0000-000000000017',
      'bc000018-0000-0000-0000-000000000018',
      'bc000019-0000-0000-0000-000000000019',
      'bc000020-0000-0000-0000-000000000020',
      'bc000021-0000-0000-0000-000000000021'
    )
);

delete from bounty_contributions
where bounty_id in (
  select id from bounties
  where is_official = true
    and status <> 'paid'
    and id in (
      'bc000001-0000-0000-0000-000000000001',
      'bc000002-0000-0000-0000-000000000002',
      'bc000003-0000-0000-0000-000000000003',
      'bc000014-0000-0000-0000-000000000014',
      'bc000015-0000-0000-0000-000000000015',
      'bc000016-0000-0000-0000-000000000016',
      'bc000017-0000-0000-0000-000000000017',
      'bc000018-0000-0000-0000-000000000018',
      'bc000019-0000-0000-0000-000000000019',
      'bc000020-0000-0000-0000-000000000020',
      'bc000021-0000-0000-0000-000000000021'
    )
);

delete from escrow_transactions
where bounty_id in (
  select id from bounties
  where is_official = true
    and status <> 'paid'
    and id in (
      'bc000001-0000-0000-0000-000000000001',
      'bc000002-0000-0000-0000-000000000002',
      'bc000003-0000-0000-0000-000000000003',
      'bc000014-0000-0000-0000-000000000014',
      'bc000015-0000-0000-0000-000000000015',
      'bc000016-0000-0000-0000-000000000016',
      'bc000017-0000-0000-0000-000000000017',
      'bc000018-0000-0000-0000-000000000018',
      'bc000019-0000-0000-0000-000000000019',
      'bc000020-0000-0000-0000-000000000020',
      'bc000021-0000-0000-0000-000000000021'
    )
);

update posts set bounty_id = null
where bounty_id in (
  select id from bounties
  where is_official = true
    and status <> 'paid'
    and id in (
      'bc000001-0000-0000-0000-000000000001',
      'bc000002-0000-0000-0000-000000000002',
      'bc000003-0000-0000-0000-000000000003',
      'bc000014-0000-0000-0000-000000000014',
      'bc000015-0000-0000-0000-000000000015',
      'bc000016-0000-0000-0000-000000000016',
      'bc000017-0000-0000-0000-000000000017',
      'bc000018-0000-0000-0000-000000000018',
      'bc000019-0000-0000-0000-000000000019',
      'bc000020-0000-0000-0000-000000000020',
      'bc000021-0000-0000-0000-000000000021'
    )
);

insert into markets (id, slug, question, category, yes_price, no_price, volume, end_date, url, last_synced) values
  ('573647', 'will-gpt-6-be-released', 'Will GPT-6 be released before GTA VI?', 'AI', 0.505, 0.495, 670074.75795, '2026-07-31T12:00:00+00', 'https://polymarket.com/event/will-gpt-6-be-released', now()),
  ('540820', 'trump-out-as-president-before-gta-vi-846', 'Trump out as President before GTA VI?', 'Politics', 0.495, 0.505, 690843.012081, '2026-07-31T12:00:00+00', 'https://polymarket.com/event/trump-out-as-president-before-gta-vi-846', now()),
  ('540818', 'new-playboi-carti-album-before-gta-vi-421', 'New Playboi Carti Album before GTA VI?', 'Culture', 0.53, 0.47, 744893.801893, '2026-07-31T12:00:00+00', 'https://polymarket.com/event/new-playboi-carti-album-before-gta-vi-421', now()),
  ('599304', 'will-haley-stevens-win-the-2026-michigan-democratic-primary', 'Will Haley Stevens win the 2026 Michigan Democratic Primary?', 'Politics', 0.1455, 0.8545, 51556.08442, '2026-08-04T00:00:00+00', 'https://polymarket.com/event/will-haley-stevens-win-the-2026-michigan-democratic-primary', now()),
  ('599305', 'will-abdul-el-sayed-win-the-2026-michigan-democratic-primary', 'Will Abdul El-Sayed win the 2026 Michigan Democratic Primary?', 'Politics', 0.84, 0.16, 170688.896572, '2026-08-04T00:00:00+00', 'https://polymarket.com/event/will-abdul-el-sayed-win-the-2026-michigan-democratic-primary', now()),
  ('601920', 'will-any-presidential-candidate-win-outright-in-the-first-round-of-the-brazil-election', 'Will any presidential candidate win outright in the first round of the Brazil election?', 'Politics', 0.16, 0.84, 78672.067183, '2026-10-04T00:00:00+00', 'https://polymarket.com/event/will-any-presidential-candidate-win-outright-in-the-first-round-of-the-brazil-election', now()),
  ('601922', 'will-luiz-incio-lula-da-silva-qualify-for-brazils-presidential-runoff', 'Will Luiz Inacio Lula da Silva qualify for Brazil''s presidential runoff?', 'Politics', 0.895, 0.105, 184788.234893, '2026-10-04T00:00:00+00', 'https://polymarket.com/event/will-luiz-incio-lula-da-silva-qualify-for-brazils-presidential-runoff', now()),
  ('593972', 'will-bernie-endorse-james-talarico-for-tx-sen-by-nov-2-2026-et', 'Will Bernie endorse James Talarico for TX-Sen by Nov 2 2026 ET?', 'Politics', 0.675, 0.325, 73490.749295, '2026-11-03T00:00:00+00', 'https://polymarket.com/event/will-bernie-endorse-james-talarico-for-tx-sen-by-nov-2-2026-et', now()),
  ('2467359', 'will-ethereum-reach-2250-by-december-31-2026-from-june-8', 'Will Ethereum reach $2,250 by December 31, 2026?', 'Crypto', 0.415, 0.585, 1498.771144, '2027-01-01T05:00:00+00', 'https://polymarket.com/event/will-ethereum-reach-2250-by-december-31-2026-from-june-8', now()),
  ('2467362', 'will-ethereum-dip-to-1250-by-december-31-2026-from-june-8', 'Will Ethereum dip to $1,250 by December 31, 2026?', 'Crypto', 0.565, 0.435, 5245.896865, '2027-01-01T05:00:00+00', 'https://polymarket.com/event/will-ethereum-dip-to-1250-by-december-31-2026-from-june-8', now()),
  ('2467358', 'will-ethereum-reach-2500-by-december-31-2026-from-june-8', 'Will Ethereum reach $2,500 by December 31, 2026?', 'Crypto', 0.325, 0.675, 550.392044, '2027-01-01T05:00:00+00', 'https://polymarket.com/event/will-ethereum-reach-2500-by-december-31-2026-from-june-8', now())
on conflict (id) do update set
  slug = excluded.slug,
  question = excluded.question,
  category = excluded.category,
  yes_price = excluded.yes_price,
  no_price = excluded.no_price,
  volume = excluded.volume,
  end_date = excluded.end_date,
  url = excluded.url,
  last_synced = now();

insert into bounties (
  id, created_by, market_id, title, description, task,
  reward_sol_lamports, reward_influence, kind, status,
  deposit_tx, creator_wallet, is_official, funded_at, expires_at, collection, creator_base_lamports
) values
  (
    'bc000001-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000bc',
    '573647',
    'GPT-6 before GTA VI - release watch',
    'Official VALORE - GPT-6 before GTA VI - YES ~51% - live through July 31, 2026.',
    'Publish a sourced release-watch brief on Home: model release signals, OpenAI product hints, credible journalist notes, and counterarguments. Submit 3 links or screenshots plus your final YES/NO read. No rumors without source context.',
    1200000000, 120, 'intel', 'open',
    'VxRow001Gpt6BeforeGtaViReleaseWatch2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-31T12:00:00+00', 'current_ops', 1200000000
  ),
  (
    'bc000002-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000bc',
    '540820',
    'Trump before GTA VI - legal calendar monitor',
    'Official VALORE - Trump out as President before GTA VI - YES ~50% - high-volume July 2026 book.',
    'Build a calendar tracker covering court dates, official White House schedule, GTA VI release timing, and credible legal/political catalysts. Post one concise Home thread with sources and a risk table; submit the thread link and source screenshots.',
    1000000000, 100, 'intel', 'open',
    'VxRow002TrumpGtaViLegalCalendar2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-31T12:00:00+00', 'current_ops', 1000000000
  ),
  (
    'bc000003-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-0000000000bc',
    '540818',
    'Carti album before GTA VI - signal board',
    'Official VALORE - new Playboi Carti album before GTA VI - YES ~53% - culture market with live catalysts.',
    'Track DSP pre-save pages, label posts, tour dates, and credible music press. Post a Home brief with a dated signal board and tag the market. Submit screenshots of at least 4 signals and one paragraph explaining the implied timing.',
    900000000, 90, 'intel', 'open',
    'VxRow003CartiAlbumSignalBoard2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-07-31T12:00:00+00', 'current_ops', 900000000
  ),
  (
    'bc000014-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-0000000000bc',
    '599304',
    'Michigan primary - Haley Stevens field read',
    'Official VALORE - Haley Stevens 2026 Michigan Democratic Primary - YES ~15% - August 4 close.',
    'Collect campaign-ad buys, endorsement updates, polling, and local press for Haley Stevens. Post a Home thread with 3 sourced bullets and one mispricing thesis. Submit source links/screenshots and the post link.',
    800000000, 80, 'intel', 'open',
    'VxRow014MichiganHaleyStevensFieldRead2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-08-04T00:00:00+00', 'current_ops', 800000000
  ),
  (
    'bc000015-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-0000000000bc',
    '599305',
    'Michigan primary - Abdul El-Sayed counterread',
    'Official VALORE - Abdul El-Sayed 2026 Michigan Democratic Primary - YES ~84% - favorite-risk brief.',
    'Write the strongest countercase to the market favorite: turnout risks, opponent endorsements, fundraising, and recent polling. Post it on Home with the market tagged. Submit the thread plus at least 3 source captures.',
    750000000, 75, 'intel', 'open',
    'VxRow015MichiganAbdulCounterread2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-08-04T00:00:00+00', 'current_ops', 750000000
  ),
  (
    'bc000016-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-0000000000bc',
    '601920',
    'Brazil 2026 - first-round outright tracker',
    'Official VALORE - Brazil election first-round outright winner - YES ~16% - October 4 close.',
    'Build a polling digest with first-round thresholds, fragmented candidate share, and runoff assumptions. Post a Home thread with chart or table. Submit source links, screenshot proof, and your final probability band.',
    700000000, 70, 'intel', 'open',
    'VxRow016BrazilFirstRoundTracker2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-10-04T00:00:00+00', 'current_ops', 700000000
  ),
  (
    'bc000017-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-0000000000bc',
    '601922',
    'Brazil 2026 - Lula runoff risk brief',
    'Official VALORE - Lula runoff qualification - YES ~90% - consensus check before October.',
    'Produce a downside-risk brief: health, eligibility, coalition shifts, and polling variance. Post one Home analysis with sources and a base/bear case split. Submit the post link and screenshots of cited data.',
    650000000, 65, 'intel', 'open',
    'VxRow017BrazilLulaRunoffRisk2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-10-04T00:00:00+00', 'current_ops', 650000000
  ),
  (
    'bc000018-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-0000000000bc',
    '593972',
    'Bernie x Talarico - endorsement radar',
    'Official VALORE - Bernie endorses James Talarico by Nov 2 - YES ~68% - source-watch market.',
    'Monitor campaign calendars, joint appearances, FEC-style fundraising signals, and Bernie/Talarico channels. Post a Home update with a dated timeline and confidence score. Submit at least 4 source captures.',
    600000000, 60, 'intel', 'open',
    'VxRow018BernieTalaricoEndorsementRadar2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2026-11-03T00:00:00+00', 'current_ops', 600000000
  ),
  (
    'bc000019-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-0000000000bc',
    '2467359',
    'ETH 2250 - year-end path map',
    'Official VALORE - Ethereum reaches $2,250 by Dec 31, 2026 - YES ~42% - low-volume crypto book.',
    'Post a 5-signal crypto path map: spot flows, ETF data, ETH/BTC trend, stablecoin liquidity, and macro calendar. Submit the Home thread plus chart screenshots. Keep it analytical; no coordinated trade instructions.',
    550000000, 55, 'intel', 'open',
    'VxRow019Eth2250PathMap2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2027-01-01T05:00:00+00', 'current_ops', 550000000
  ),
  (
    'bc000020-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-0000000000bc',
    '2467362',
    'ETH 1250 dip - bear-case dossier',
    'Official VALORE - Ethereum dips to $1,250 by Dec 31, 2026 - YES ~57% - contested downside book.',
    'Prepare a bear-case dossier with liquidation levels, macro shock windows, protocol/event risk, and invalidation points. Post the dossier on Home and submit the post link with 3 chart/source screenshots.',
    450000000, 45, 'intel', 'open',
    'VxRow020Eth1250BearCaseDossier2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2027-01-01T05:00:00+00', 'current_ops', 450000000
  ),
  (
    'bc000021-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-0000000000bc',
    '2467358',
    'ETH 2500 - upside catalyst board',
    'Official VALORE - Ethereum reaches $2,500 by Dec 31, 2026 - YES ~33% - thin upside target.',
    'Build an upside catalyst board with dated catalysts and a simple probability tree. Post it on Home with the market tagged. Submit the post link and source screenshots for every catalyst listed.',
    350000000, 35, 'intel', 'open',
    'VxRow021Eth2500UpsideCatalystBoard2026',
    'Vlre7vKp2mN9xQ4wR8tY3uI6oP1sL5nM0bV7xZ2wQ9kH', true, now(), '2027-01-01T05:00:00+00', 'current_ops', 350000000
  )
on conflict (id) do update set
  created_by = excluded.created_by,
  market_id = excluded.market_id,
  title = excluded.title,
  description = excluded.description,
  task = excluded.task,
  reward_sol_lamports = excluded.reward_sol_lamports,
  reward_influence = excluded.reward_influence,
  kind = excluded.kind,
  deposit_tx = excluded.deposit_tx,
  creator_wallet = excluded.creator_wallet,
  is_official = true,
  funded_at = case when bounties.status = 'paid' then bounties.funded_at else now() end,
  expires_at = excluded.expires_at,
  collection = excluded.collection,
  creator_base_lamports = excluded.creator_base_lamports,
  status = case when bounties.status = 'paid' then bounties.status else 'open' end,
  helper_id = case when bounties.status = 'paid' then bounties.helper_id else null end,
  proof = case when bounties.status = 'paid' then bounties.proof else null end,
  payout_tx = case when bounties.status = 'paid' then bounties.payout_tx else null end,
  helper_wallet = case when bounties.status = 'paid' then bounties.helper_wallet else null end,
  assigned_at = case when bounties.status = 'paid' then bounties.assigned_at else null end,
  submitted_at = case when bounties.status = 'paid' then bounties.submitted_at else null end,
  paid_at = case when bounties.status = 'paid' then bounties.paid_at else null end;
