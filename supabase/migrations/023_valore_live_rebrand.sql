-- Align live data to the VALORE brand.

update profiles
set
  codename = 'valore_official',
  display_name = 'VALORE',
  avatar_seed = 'valore_official',
  privy_did = 'seed:valore_official',
  is_verified = true,
  bio = 'Official bounties from the network. Real Polymarket targets. SOL rewards in escrow.'
where id = '00000000-0000-0000-0000-0000000000bc'
   or (privy_did like 'seed:%' and codename like '%\_official' escape '\');

update cabals
set
  slug = 'valore-official',
  name = 'VALORE',
  motto = 'Official VALORE hub - intel, coordination, and market ops.',
  description = 'The public home cabal for every VALORE operator. Thin-book targets, bounty coordination, and MARKET OPS plays in one crew. Join to stay aligned with the official network.',
  emblem_seed = 'valore_official'
where id = '00000000-0000-0000-0000-0000000000c1'
   or slug like '%-official';

update bounties
set description = regexp_replace(description, '^Official [^·-]+', 'Official VALORE')
where is_official = true
  and description is not null;

update profiles
set avatar_seed = concat('vlre-', split_part(avatar_seed, '-', 2), '-', split_part(avatar_seed, '-', 3))
where avatar_seed ~ '^[a-z]+-(normal|vip|election)-[0-9]{2}$';
