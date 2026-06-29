-- VALORE rebrand: official operator + cabal + bounty copy

UPDATE profiles SET
  codename = 'valore_official',
  display_name = 'VALORE',
  avatar_seed = 'valore_official',
  privy_did = 'seed:valore_official'
WHERE codename = 'valore_official'
   OR privy_did = 'seed:valore_official';

UPDATE profiles SET
  codename = 'valore_official',
  display_name = 'VALORE',
  avatar_seed = 'valore_official'
WHERE codename = 'valore' AND privy_did LIKE 'seed:%';

UPDATE cabals SET
  slug = 'valore-official',
  name = 'VALORE',
  motto = 'VALORE',
  description = replace(replace(description, 'VALORE', 'VALORE'), 'valore', 'valore')
WHERE slug = 'valore-official';

UPDATE bounties SET
  description = replace(replace(description, 'Official VALORE', 'Official VALORE'), 'Official VALORE', 'Official VALORE')
WHERE description ILIKE '%valore%'
   OR description ILIKE '%VALORE%';

UPDATE bounties SET description = replace(description, 'Official VALORE', 'Official VALORE')
WHERE created_by IN (SELECT id FROM profiles WHERE codename = 'valore_official');
