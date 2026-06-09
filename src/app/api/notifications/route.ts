import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import type { Notification } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ notifications: [], unread: 0 });

  const notifications = await query<Notification>(
    `select * from notifications where profile_id = $1 order by created_at desc limit 40`,
    [ctx.profile.id],
  );
  const unread = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await query("update notifications set read = true where profile_id = $1 and read = false", [
    ctx.profile.id,
  ]);
  return NextResponse.json({ ok: true });
}
