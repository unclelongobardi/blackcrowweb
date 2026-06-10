import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(_request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const exists = await queryOne("select id from posts where id = $1", [id]);
  if (!exists) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await query(
    `insert into post_views (post_id, profile_id) values ($1, $2)
     on conflict (post_id, profile_id) do nothing`,
    [id, ctx.profile.id],
  );

  const row = await queryOne<{ count: string }>(
    "select count(*)::text as count from post_views where post_id = $1",
    [id],
  );

  return NextResponse.json({ view_count: Number(row?.count ?? 0) });
}
