-- API rate limit buckets (Postgres-backed for Vercel serverless)
create table if not exists api_rate_limits (
  bucket text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create index if not exists idx_api_rate_limits_reset_at on api_rate_limits (reset_at);
