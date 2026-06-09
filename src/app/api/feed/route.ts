import { NextResponse } from "next/server";
import { getAuthedProfile, getProfileId } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import type { Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ posts: [] });
  const url = new URL(request.url);
  const operationId = url.searchParams.get("operation_id");
  const marketId = url.searchParams.get("market_id");
  const myId = await getProfileId(request);

  const conditions = ["p.parent_id is null"];
  const params: unknown[] = [myId];
  if (operationId) {
    params.push(operationId);
    conditions.push(`p.operation_id = $${params.length}`);
  }
  if (marketId) {
    params.push(marketId);
    conditions.push(`p.market_id = $${params.length}`);
  }

  const posts = await query<Post>(
    `select p.*,
        row_to_json(a) as author,
        case when m.id is not null then row_to_json(m) else null end as market,
        case when p.bounty_id is not null then (
          select row_to_json(sub) from (
            select bw.*,
              row_to_json(cr) as creator,
              case when mk.id is not null then row_to_json(mk) else null end as market
            from bounties bw
            left join profiles cr on cr.id = bw.created_by
            left join markets mk on mk.id = bw.market_id
            where bw.id = p.bounty_id
          ) sub
        ) else null end as bounty,
        coalesce((select sum(value) from post_votes v where v.post_id = p.id), 0)::int as score,
        (select count(*) from posts c where c.parent_id = p.id)::int as reply_count,
        coalesce((select value from post_votes v where v.post_id = p.id and v.profile_id = $1), 0)::int as my_vote
      from posts p
      left join profiles a on a.id = p.author_id
      left join markets m on m.id = p.market_id
      where ${conditions.join(" and ")}
      order by p.created_at desc
      limit 50`,
    params,
  );

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();
  if (!content || content.length > 600) {
    return NextResponse.json({ error: "Post must be 1-600 characters." }, { status: 400 });
  }
  const sentiment = ["bullish", "bearish", "neutral"].includes(body.sentiment) ? body.sentiment : "neutral";

  const post = await queryOne<Post>(
    `insert into posts (author_id, content, sentiment, market_id, operation_id, bounty_id, parent_id)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning *`,
    [
      ctx.profile.id,
      content,
      sentiment,
      body.market_id ?? null,
      body.operation_id ?? null,
      body.bounty_id ?? null,
      body.parent_id ?? null,
    ],
  );

  // Reward: posting intel grants +2 influence.
  await query("update profiles set influence = influence + 2 where id = $1", [ctx.profile.id]);

  return NextResponse.json({
    post: { ...post, author: ctx.profile, score: 0, reply_count: 0, my_vote: 0 },
  });
}
