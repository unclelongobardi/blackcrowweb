import { query, queryOne } from "./db";

export async function rateLimitCheck(
  bucket: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: true } | { allowed: false; retryAfterSec: number }> {
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  const row = await queryOne<{ count: number; reset_at: Date }>(
    "select count, reset_at from api_rate_limits where bucket = $1",
    [bucket],
  );

  if (!row || row.reset_at.getTime() <= now) {
    await query(
      `insert into api_rate_limits (bucket, count, reset_at)
       values ($1, 1, $2)
       on conflict (bucket) do update set count = 1, reset_at = excluded.reset_at`,
      [bucket, resetAt],
    );
    return { allowed: true };
  }

  if (row.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((row.reset_at.getTime() - now) / 1000)),
    };
  }

  await query("update api_rate_limits set count = count + 1 where bucket = $1", [bucket]);
  return { allowed: true };
}

/** Drop expired buckets (best-effort housekeeping). */
export async function pruneExpiredRateLimits(): Promise<void> {
  await query("delete from api_rate_limits where reset_at < now()");
}
