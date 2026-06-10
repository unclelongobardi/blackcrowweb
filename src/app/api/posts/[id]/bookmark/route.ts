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

  const existing = await queryOne(
    "select 1 from post_bookmarks where post_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );

  if (existing) {
    await query("delete from post_bookmarks where post_id = $1 and profile_id = $2", [id, ctx.profile.id]);
  } else {
    await query("insert into post_bookmarks (post_id, profile_id) values ($1, $2)", [id, ctx.profile.id]);
  }

  const bookmarked = !existing;
  const row = await queryOne<{ count: string }>(
    "select count(*)::text as count from post_bookmarks where post_id = $1",
    [id],
  );

  return NextResponse.json({ my_bookmarked: bookmarked, bookmark_count: Number(row?.count ?? 0) });
}
