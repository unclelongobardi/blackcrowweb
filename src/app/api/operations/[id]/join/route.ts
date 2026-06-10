import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const conviction = Math.min(100, Math.max(1, Number(body.conviction ?? 50) || 50));

  const existing = await queryOne(
    "select 1 from operation_joins where operation_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );

  if (existing) {
    await query("delete from operation_joins where operation_id = $1 and profile_id = $2", [
      id,
      ctx.profile.id,
    ]);
    await query("update profiles set influence = greatest(influence - 1, 0) where id = $1", [ctx.profile.id]);
    return NextResponse.json({ joined: false });
  }

  await query(
    "insert into operation_joins (operation_id, profile_id, conviction) values ($1, $2, $3)",
    [id, ctx.profile.id, conviction],
  );
  // Reward: enlisting grants +1 influence.
  await query("update profiles set influence = influence + 1 where id = $1", [ctx.profile.id]);

  return NextResponse.json({ joined: true });
}
