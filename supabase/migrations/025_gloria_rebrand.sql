-- Rebrand the live VALORE data model to GLORIA.

-- Existing selectable avatar IDs used the previous brand prefix. Renaming them
-- keeps saved profiles pointed at the same artwork after the asset rebrand.
update profiles
set avatar_seed = regexp_replace(avatar_seed, '^vlre-', 'gloria-')
where avatar_seed like 'vlre-%';

update profiles
set
  codename = 'gloria_official',
  display_name = 'GLORIA',
  avatar_seed = 'gloria_official',
  privy_did = 'seed:gloria_official',
  is_verified = true,
  bio = 'Official bounties from GLORIA. Real prediction-market targets. SOL rewards in escrow.'
where id = '00000000-0000-0000-0000-0000000000bc'
   or codename = 'valore_official'
   or privy_did = 'seed:valore_official';

update cabals
set
  slug = 'gloria-official',
  name = 'GLORIA',
  motto = 'Official GLORIA hub - intel, coordination, and market ops.',
  description = 'The public home cabal for every GLORIA operator. Thin-book targets, bounty coordination, and MARKET OPS plays in one crew.',
  emblem_seed = 'gloria_official'
where id = '00000000-0000-0000-0000-0000000000c1'
   or slug = 'valore-official';

update bounties
set
  title = replace(title, 'VALORE', 'GLORIA'),
  description = replace(description, 'VALORE', 'GLORIA'),
  task = replace(task, 'VALORE', 'GLORIA'),
  deposit_tx = regexp_replace(deposit_tx, '^Vlre', 'Gloria'),
  creator_wallet = regexp_replace(creator_wallet, '^Vlre', 'Gloria')
where is_official = true;

update notifications
set body = replace(body, 'VALORE', 'GLORIA')
where body like '%VALORE%';
