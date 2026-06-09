alter table posts add column if not exists bounty_id uuid references bounties(id) on delete set null;
create index if not exists idx_posts_bounty on posts(bounty_id);
