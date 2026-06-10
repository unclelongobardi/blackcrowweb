import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function counts(postId: string, profileId: string) {
  const row = await queryOne<{
    like_count: string;
    repost_count: string;
    view_count: string;
    my_reposted: boolean;
    my_bookmarked: boolean;
  }>(
    `select
       (select count(*) from post_votes where post_id = $1 and value = 1)::text as like_count,
       (select count(*) from post_reposts where post_id = $1)::text as repost_count,
       (select count(*) from post_views where post_id = $1)::text as view_count,
       exists (select 1 from post_reposts where post_id = $1 and profile_id = $2) as my_reposted,
       exists (select 1 from post_bookmarks where post_id = $1 and profile_id = $2) as my_bookmarked`,
    [postId, profileId],
  );
  return {
    like_count: Number(row?.like_count ?? 0),
    repost_count: Number(row?.repost_count ?? 0),
    view_count: Number(row?.view_count ?? 0),
    my_reposted: !!row?.my_reposted,
    my_bookmarked: !!row?.my_bookmarked,
  };
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(_request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const exists = await queryOne("select id from posts where id = $1", [id]);
  if (!exists) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const existing = await queryOne(
    "select 1 from post_reposts where post_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );

  if (existing) {
    await query("delete from post_reposts where post_id = $1 and profile_id = $2", [id, ctx.profile.id]);
  } else {
    await query("insert into post_reposts (post_id, profile_id) values ($1, $2)", [id, ctx.profile.id]);
  }

  const stats = await counts(id, ctx.profile.id);
  return NextResponse.json({ ...stats, my_reposted: !existing });
}
