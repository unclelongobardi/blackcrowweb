-- Real post engagement: reposts, bookmarks, views.

create table if not exists post_reposts (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists post_bookmarks (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists post_views (
  post_id    uuid references posts(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create index if not exists idx_post_reposts_profile on post_reposts(profile_id, created_at desc);
create index if not exists idx_post_bookmarks_profile on post_bookmarks(profile_id, created_at desc);
