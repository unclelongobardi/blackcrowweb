import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ codename: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { codename } = await params;

  const target = await queryOne<{ id: string; codename: string }>(
    "select id, codename from profiles where lower(codename) = lower($1)",
    [codename],
  );
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.id === ctx.profile.id) {
    return NextResponse.json({ error: "Cannot follow yourself." }, { status: 400 });
  }

  const existing = await queryOne(
    "select 1 from follows where follower_id = $1 and following_id = $2",
    [ctx.profile.id, target.id],
  );

  if (existing) {
    await query("delete from follows where follower_id = $1 and following_id = $2", [
      ctx.profile.id,
      target.id,
    ]);
    return NextResponse.json({ following: false });
  }

  await query("insert into follows (follower_id, following_id) values ($1, $2)", [
    ctx.profile.id,
    target.id,
  ]);
  await notify(
    target.id,
    "follow",
    `${ctx.profile.codename} started following you`,
    `/app/u/${ctx.profile.codename}`,
  );
  return NextResponse.json({ following: true });
}
