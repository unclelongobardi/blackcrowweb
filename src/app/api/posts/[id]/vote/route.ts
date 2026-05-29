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
  const value = body.value === 1 || body.value === -1 ? body.value : 0;

  const existing = await queryOne<{ value: number }>(
    "select value from post_votes where post_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );

  let myVote = 0;
  if (value === 0 || (existing && existing.value === value)) {
    await query("delete from post_votes where post_id = $1 and profile_id = $2", [id, ctx.profile.id]);
  } else {
    await query(
      `insert into post_votes (post_id, profile_id, value) values ($1, $2, $3)
       on conflict (post_id, profile_id) do update set value = excluded.value`,
      [id, ctx.profile.id, value],
    );
    myVote = value;
  }

  const row = await queryOne<{ score: string }>(
    "select coalesce(sum(value), 0) as score from post_votes where post_id = $1",
    [id],
  );

  return NextResponse.json({ score: Number(row?.score ?? 0), my_vote: myVote });
}
