import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import type { Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ posts: [] });
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myId = ctx.profile.id;
  const posts = await query<Post>(
    `select p.*,
        row_to_json(a) as author,
        case when m.id is not null then row_to_json(m) else null end as market,
        (select count(*) from post_votes v where v.post_id = p.id and v.value = 1)::int as like_count,
        (select count(*) from post_reposts rp where rp.post_id = p.id)::int as repost_count,
        (select count(*) from post_views vw where vw.post_id = p.id)::int as view_count,
        coalesce((select sum(value) from post_votes v where v.post_id = p.id), 0)::int as score,
        (select count(*) from posts c where c.parent_id = p.id)::int as reply_count,
        coalesce((select value from post_votes v where v.post_id = p.id and v.profile_id = $1), 0)::int as my_vote,
        exists (select 1 from post_reposts rp where rp.post_id = p.id and rp.profile_id = $1) as my_reposted,
        exists (select 1 from post_bookmarks bm where bm.post_id = p.id and bm.profile_id = $1) as my_bookmarked
      from post_bookmarks bm
      join posts p on p.id = bm.post_id
      left join profiles a on a.id = p.author_id
      left join markets m on m.id = p.market_id
      where bm.profile_id = $1 and p.parent_id is null
      order by bm.created_at desc
      limit 50`,
    [myId],
  );

  return NextResponse.json({ posts });
}
