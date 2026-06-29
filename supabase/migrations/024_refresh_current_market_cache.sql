-- Refresh official VALORE bounty market cache as of 2026-06-29.
-- Bounty cards now display live linked-market prices, so descriptions avoid frozen odds.

insert into markets (id, slug, question, category, yes_price, no_price, volume, end_date, url, last_synced) values
  ('573647', 'will-gpt-6-be-released', 'Will GPT-6 be released before GTA VI?', 'AI', 0.505, 0.495, 670232.1118699969, '2026-07-31T12:00:00+00', 'https://polymarket.com/event/will-gpt-6-be-released', now()),
  ('540820', 'trump-out-as-president-before-gta-vi-846', 'Trump out as President before GTA VI?', 'Politics', 0.495, 0.505, 690982.3361940075, '2026-07-31T12:00:00+00', 'https://polymarket.com/event/trump-out-as-president-before-gta-vi-846', now()),
  ('540818', 'new-playboi-carti-album-before-gta-vi-421', 'New Playboi Carti Album before GTA VI?', 'Culture', 0.515, 0.485, 745001.8213849459, '2026-07-31T12:00:00+00', 'https://polymarket.com/event/new-playboi-carti-album-before-gta-vi-421', now()),
  ('599304', 'will-haley-stevens-win-the-2026-michigan-democratic-primary', 'Will Haley Stevens win the 2026 Michigan Democratic Primary?', 'Politics', 0.1535, 0.8465, 56202.094630999956, '2026-08-04T00:00:00+00', 'https://polymarket.com/event/will-haley-stevens-win-the-2026-michigan-democratic-primary', now()),
  ('599305', 'will-abdul-el-sayed-win-the-2026-michigan-democratic-primary', 'Will Abdul El-Sayed win the 2026 Michigan Democratic Primary?', 'Politics', 0.815, 0.185, 174818.1701709998, '2026-08-04T00:00:00+00', 'https://polymarket.com/event/will-abdul-el-sayed-win-the-2026-michigan-democratic-primary', now()),
  ('601920', 'will-any-presidential-candidate-win-outright-in-the-first-round-of-the-brazil-election', 'Will any presidential candidate win outright in the first round of the Brazil election?', 'Politics', 0.145, 0.855, 78903.39307299968, '2026-10-04T00:00:00+00', 'https://polymarket.com/event/will-any-presidential-candidate-win-outright-in-the-first-round-of-the-brazil-election', now()),
  ('601922', 'will-luiz-incio-lula-da-silva-qualify-for-brazils-presidential-runoff', 'Will Luiz Inacio Lula da Silva qualify for Brazil''s presidential runoff?', 'Politics', 0.895, 0.105, 184892.38489299928, '2026-10-04T00:00:00+00', 'https://polymarket.com/event/will-luiz-incio-lula-da-silva-qualify-for-brazils-presidential-runoff', now()),
  ('593972', 'will-bernie-endorse-james-talarico-for-tx-sen-by-nov-2-2026-et', 'Will Bernie endorse James Talarico for TX-Sen by Nov 2 2026 ET?', 'Politics', 0.4, 0.6, 73550.99067299996, '2026-11-03T00:00:00+00', 'https://polymarket.com/event/will-bernie-endorse-james-talarico-for-tx-sen-by-nov-2-2026-et', now()),
  ('2467359', 'will-ethereum-reach-2250-by-december-31-2026-from-june-8', 'Will Ethereum reach $2,250 by December 31, 2026?', 'Crypto', 0.4, 0.6, 1504.5649219999996, '2027-01-01T05:00:00+00', 'https://polymarket.com/event/will-ethereum-reach-2250-by-december-31-2026-from-june-8', now()),
  ('2467362', 'will-ethereum-dip-to-1250-by-december-31-2026-from-june-8', 'Will Ethereum dip to $1,250 by December 31, 2026?', 'Crypto', 0.565, 0.435, 5973.145629000001, '2027-01-01T05:00:00+00', 'https://polymarket.com/event/will-ethereum-dip-to-1250-by-december-31-2026-from-june-8', now()),
  ('2467358', 'will-ethereum-reach-2500-by-december-31-2026-from-june-8', 'Will Ethereum reach $2,500 by December 31, 2026?', 'Crypto', 0.24, 0.76, 1701.003154, '2027-01-01T05:00:00+00', 'https://polymarket.com/event/will-ethereum-reach-2500-by-december-31-2026-from-june-8', now())
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

update bounties
set description = case id
  when 'bc000001-0000-0000-0000-000000000001' then 'Official VALORE - live AI release market - closes July 31, 2026. Use the linked YES price below.'
  when 'bc000002-0000-0000-0000-000000000002' then 'Official VALORE - live high-volume politics book - closes July 31, 2026. Use the linked YES price below.'
  when 'bc000003-0000-0000-0000-000000000003' then 'Official VALORE - live culture catalyst market - closes July 31, 2026. Use the linked YES price below.'
  when 'bc000014-0000-0000-0000-000000000014' then 'Official VALORE - live Michigan Democratic primary market - closes August 4, 2026. Use the linked YES price below.'
  when 'bc000015-0000-0000-0000-000000000015' then 'Official VALORE - live Michigan Democratic primary market - closes August 4, 2026. Use the linked YES price below.'
  when 'bc000016-0000-0000-0000-000000000016' then 'Official VALORE - live Brazil first-round election market - closes October 4, 2026. Use the linked YES price below.'
  when 'bc000017-0000-0000-0000-000000000017' then 'Official VALORE - live Brazil runoff qualification market - closes October 4, 2026. Use the linked YES price below.'
  when 'bc000018-0000-0000-0000-000000000018' then 'Official VALORE - live endorsement-watch market - closes November 3, 2026. Use the linked YES price below.'
  when 'bc000019-0000-0000-0000-000000000019' then 'Official VALORE - live ETH upside market - closes January 1, 2027. Use the linked YES price below.'
  when 'bc000020-0000-0000-0000-000000000020' then 'Official VALORE - live ETH downside market - closes January 1, 2027. Use the linked YES price below.'
  when 'bc000021-0000-0000-0000-000000000021' then 'Official VALORE - live ETH upside market - closes January 1, 2027. Use the linked YES price below.'
  else description
end
where id in (
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
and status <> 'paid';

update bounties
set deposit_tx = regexp_replace(deposit_tx, '^VxRow', 'VlreRow')
where is_official = true
  and collection = 'current_ops'
  and status <> 'paid'
  and deposit_tx like 'VxRow%';
