import { NextResponse } from "next/server";
import { rateLimitCheck } from "./rateLimit";

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

const LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "deposit-tx": { limit: 20, windowMs: 60_000 },
  fund: { limit: 8, windowMs: 60_000 },
  contribute: { limit: 15, windowMs: 60_000 },
  approve: { limit: 6, windowMs: 60_000 },
  cancel: { limit: 6, windowMs: 60_000 },
  accept: { limit: 20, windowMs: 60_000 },
  upload: { limit: 12, windowMs: 60_000 },
};

export async function enforceFinancialRateLimit(
  request: Request,
  profileId: string,
  action: keyof typeof LIMITS,
): Promise<NextResponse | null> {
  const { limit, windowMs } = LIMITS[action];
  const ip = clientIp(request);
  const bucket = `fin:${action}:${profileId}:${ip}`;
  const result = await rateLimitCheck(bucket, limit, windowMs);
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please wait and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } },
  );
}

export async function enforceUploadRateLimit(
  request: Request,
  profileId: string,
): Promise<NextResponse | null> {
  return enforceFinancialRateLimit(request, profileId, "upload");
}
