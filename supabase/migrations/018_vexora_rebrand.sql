-- VEXORA NETWORK rebrand: official operator + cabal + bounty copy

UPDATE profiles SET
  codename = 'vexora_official',
  display_name = 'VEXORA',
  avatar_seed = 'vexora_official',
  privy_did = 'seed:vexora_official'
WHERE codename = 'blackcrow_official'
   OR privy_did = 'seed:blackcrow_official';

UPDATE profiles SET
  codename = 'vexora_official',
  display_name = 'VEXORA',
  avatar_seed = 'vexora_official'
WHERE codename = 'blackcrow' AND privy_did LIKE 'seed:%';

UPDATE cabals SET
  slug = 'vexora-official',
  name = 'VEXORA',
  motto = 'VEXORA NETWORK',
  description = replace(replace(description, 'BLACKCROW', 'VEXORA'), 'blackcrow', 'vexora')
WHERE slug = 'blackcrow-official';

UPDATE bounties SET
  description = replace(replace(description, 'Official BLACKCROW', 'Official VEXORA'), 'Official VEXORA', 'Official VEXORA')
WHERE description ILIKE '%blackcrow%'
   OR description ILIKE '%BLACKCROW%';

UPDATE bounties SET description = replace(description, 'Official BLACKCROW', 'Official VEXORA')
WHERE created_by IN (SELECT id FROM profiles WHERE codename = 'vexora_official');
