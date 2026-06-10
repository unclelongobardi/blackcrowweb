-- Track applied migrations so migrate.mjs never re-runs destructive scripts.

create table if not exists schema_migrations (
  name       text primary key,
  applied_at timestamptz not null default now()
);
