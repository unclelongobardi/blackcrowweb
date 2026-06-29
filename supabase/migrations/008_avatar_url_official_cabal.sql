-- Custom profile photo URL (data URL or CDN) + official VALORE public cabal.

alter table profiles add column if not exists avatar_url text;

-- Official public cabal
insert into cabals (
  id, slug, name, motto, description, emblem_seed, created_by, visibility, kind
) values (
  '00000000-0000-0000-0000-0000000000c1',
  'valore-official',
  'VALORE',
  'Official VALORE hub — intel, coordination, and market ops.',
  'The public home cabal for every VALORE operator. War Room drops, thin-book targets, bounty coordination, and MARKET OPS plays — all in one crew. Join to stay aligned with the official network.',
  'valore_official',
  '00000000-0000-0000-0000-0000000000bc',
  'public',
  'manipulation'
) on conflict (slug) do update set
  name = excluded.name,
  motto = excluded.motto,
  description = excluded.description,
  emblem_seed = excluded.emblem_seed,
  visibility = excluded.visibility,
  kind = excluded.kind;

insert into cabal_members (cabal_id, profile_id, role)
values (
  '00000000-0000-0000-0000-0000000000c1',
  '00000000-0000-0000-0000-0000000000bc',
  'leader'
) on conflict (cabal_id, profile_id) do update set role = 'leader';
