-- Post images, polls, and thread metadata.

alter table posts add column if not exists image_url text;
alter table posts add column if not exists kind text not null default 'post';

create table if not exists post_polls (
  post_id uuid primary key references posts(id) on delete cascade,
  options jsonb not null
);

create table if not exists post_poll_votes (
  post_id uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  option_index smallint not null,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create index if not exists idx_post_poll_votes_post on post_poll_votes(post_id);
