import { NextResponse } from "next/server";
import { isDbConfigured, query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = 15; // floor so a lone visitor still sees a lively room
const WINDOW_SECONDS = 45;

async function countOnline(): Promise<number> {
  const row = await queryOne<{ n: string }>(
    `select count(*)::int as n from presence where last_seen > now() - interval '${WINDOW_SECONDS} seconds'`,
  );
  const active = Number(row?.n ?? 0);
  // 15 floor + every additional concurrent real visitor.
  return BASE + Math.max(0, active - 1);
}

export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ online: BASE });
  const body = await request.json().catch(() => ({}));
  const sessionId = String(body.session_id ?? "").slice(0, 80);
  if (!sessionId) return NextResponse.json({ online: BASE });

  try {
    await query(
      `insert into presence (session_id, last_seen) values ($1, now())
       on conflict (session_id) do update set last_seen = now()`,
      [sessionId],
    );
    // Opportunistic cleanup of stale rows.
    await query(`delete from presence where last_seen < now() - interval '10 minutes'`);
    return NextResponse.json({ online: await countOnline() });
  } catch {
    return NextResponse.json({ online: BASE });
  }
}

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ online: BASE });
  try {
    return NextResponse.json({ online: await countOnline() });
  } catch {
    return NextResponse.json({ online: BASE });
  }
}
