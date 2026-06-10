-- Refresh official BLACKCROW bounties: market-aligned deadlines, clear tasks, updated copy.

update markets set
  question = 'Will the highest temperature in New York City be between 76-77°F on June 10?',
  category = 'Weather',
  yes_price = 0.14,
  no_price = 0.86,
  volume = 2437,
  end_date = '2026-06-11T04:00:00+00',
  url = 'https://polymarket.com/event/highest-temperature-in-nyc-on-june-10-2026/highest-temperature-in-nyc-on-june-10-2026-76-77f',
  last_synced = now()
where id = '2475650';

update markets set
  question = 'Fed rate cut by October 2026 meeting?',
  category = 'Economy',
  yes_price = 0.1395,
  no_price = 0.8605,
  volume = 51132,
  end_date = '2026-10-29T20:00:00+00',
  url = 'https://polymarket.com/event/fed-rate-cut-by-629/fed-rate-cut-by-october-2026-meeting-199-747',
  last_synced = now()
where id = '1439550';

update markets set
  question = 'Will the highest temperature in New York City be between 82-83°F on June 9?',
  category = 'Weather',
  yes_price = 0.0055,
  no_price = 0.9945,
  volume = 13958,
  end_date = '2026-06-10T04:00:00+00',
  url = 'https://polymarket.com/event/highest-temperature-in-nyc-on-june-9-2026/highest-temperature-in-nyc-on-june-9-2026-82-83f',
  last_synced = now()
where id = '2467255';

-- 1 · June 10 NYC 76–77°F field op
update bounties set
  title = 'KLGA field op — June 10 · 76–77°F YES',
  description = 'Official BLACKCROW · Polymarket weather · YES ~14% · ~$2.4k volume · resolves on Wunderground KLGA daily high for June 10.',
  task = 'Be on-site at LaGuardia (KLGA) before the June 10 daily high is recorded. Submit a timestamped photo or short video showing the station area and your location. If you trade, note your YES position on the 76–77°F bucket. Proof must include date, time, and place.',
  kind = 'action',
  expires_at = '2026-06-11T04:00:00+00',
  status = case when status = 'paid' then status else 'open' end
where id = 'bc000001-0000-0000-0000-000000000001';

-- 2 · Fed October 2026 coordination
update bounties set
  title = 'Bearish Fed-cut push — October 2026 FOMC',
  description = 'Official BLACKCROW · Fed cut by Oct ''26 meeting · YES ~14% · ~$51k volume · macro book worth a coordinated NO-side narrative.',
  task = 'Post 3+ original threads on Home tagging this market with a bearish thesis (data, charts, or catalysts). Get 2+ operators to engage or coordinate NO positioning. Submit links to your posts plus screenshots of reach or replies. One cohesive campaign — not copy-paste spam.',
  kind = 'coord',
  expires_at = '2026-10-29T20:00:00+00',
  status = case when status = 'paid' then status else 'open' end
where id = 'bc000002-0000-0000-0000-000000000002';

-- 3 · June 9 NYC 82–83°F intel
update bounties set
  title = 'KLGA intel — June 9 high reading',
  description = 'Official BLACKCROW · June 9 NYC 82–83°F bucket · resolves on Wunderground KLGA · same-day capture window.',
  task = 'Within 30 minutes of the KLGA daily high posting on Wunderground: (1) screenshot the KLGA daily-high page with visible date/time, (2) photo of the airport station area. Submit both images. Goal: timestamp the reading so the cabal can time Polymarket entries on the 82–83°F market.',
  kind = 'intel',
  expires_at = '2026-06-10T04:00:00+00',
  status = case when status = 'paid' then status else 'open' end
where id = 'bc000003-0000-0000-0000-000000000003';
