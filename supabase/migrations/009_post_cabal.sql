-- Posts can target a specific cabal (members-only) or everyone (cabal_id null).

alter table posts add column if not exists cabal_id uuid references cabals(id) on delete set null;
create index if not exists idx_posts_cabal on posts(cabal_id);
