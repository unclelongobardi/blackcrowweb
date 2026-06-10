import { NextResponse } from "next/server";
import { getAuthedProfile, getProfileId } from "@/lib/auth";
import { getPool, isDbConfigured, query, queryOne } from "@/lib/db";
import type { Market, Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function upsertMarket(m: Market) {
  if (!isDbConfigured() || !m?.id) return;
  try {
    const db = getPool();
    await db.query(
      `insert into markets (id, slug, question, category, image, yes_price, no_price, volume, end_date, url, last_synced)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
       on conflict (id) do update set
         yes_price = excluded.yes_price, no_price = excluded.no_price,
         volume = excluded.volume, last_synced = now()`,
      [m.id, m.slug, m.question, m.category, m.image, m.yes_price, m.no_price, m.volume, m.end_date, m.url],
    );
  } catch {
    /* non-fatal */
  }
}

async function attachPollData(posts: Post[], myId: string | null) {
  if (!posts.length) return posts;
  const ids = posts.map((p) => p.id);
  const polls = await query<{ post_id: string; options: string[] }>(
    `select post_id, options from post_polls where post_id = any($1::uuid[])`,
    [ids],
  );
  if (!polls.length) return posts;

  const votes = await query<{ post_id: string; option_index: number; count: string }>(
    `select post_id, option_index, count(*)::text as count
       from post_poll_votes where post_id = any($1::uuid[])
       group by post_id, option_index`,
    [ids],
  );
  const myVotes = myId
    ? await query<{ post_id: string; option_index: number }>(
        `select post_id, option_index from post_poll_votes where post_id = any($1::uuid[]) and profile_id = $2`,
        [ids, myId],
      )
    : [];

  return posts.map((p) => {
    const poll = polls.find((x) => x.post_id === p.id);
    if (!poll) return p;
    const options = Array.isArray(poll.options) ? poll.options : [];
    const counts = options.map((_, i) => {
      const row = votes.find((v) => v.post_id === p.id && v.option_index === i);
      return Number(row?.count ?? 0);
    });
    const my = myVotes.find((v) => v.post_id === p.id);
    return {
      ...p,
      poll: {
        options,
        counts,
        my_option: my?.option_index ?? null,
        total: counts.reduce((a, b) => a + b, 0),
      },
    };
  });
}

async function attachThreadPreview(posts: Post[]) {
  const threadRoots = posts.filter((p) => p.kind === "thread");
  if (!threadRoots.length) return posts;

  const enriched = await Promise.all(
    posts.map(async (p) => {
      if (p.kind !== "thread") return p;
      const replies = await query<Post>(
        `select p.*, row_to_json(a) as author
           from posts p left join profiles a on a.id = p.author_id
          where p.parent_id = $1 order by p.created_at asc limit 3`,
        [p.id],
      );
      return { ...p, thread_preview: replies };
    }),
  );
  return enriched;
}

const NO_STORE = { headers: { "Cache-Control": "no-store, max-age=0" } };

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured.", posts: [] }, { status: 503, ...NO_STORE });
  }
  const url = new URL(request.url);
  const operationId = url.searchParams.get("operation_id");
  const marketId = url.searchParams.get("market_id");
  const cabalId = url.searchParams.get("cabal_id");
  const myId = await getProfileId(request);

  const conditions = ["p.parent_id is null"];
  const params: unknown[] = [myId];

  if (cabalId) {
    params.push(cabalId);
    conditions.push(`p.cabal_id = $${params.length}`);
  } else {
    conditions.push("p.cabal_id is null");
  }

  if (operationId) {
    params.push(operationId);
    conditions.push(`p.operation_id = $${params.length}`);
  }
  if (marketId) {
    params.push(marketId);
    conditions.push(`p.market_id = $${params.length}`);
  }

  let posts: Post[];
  try {
    posts = await query<Post>(
    `select p.*,
        row_to_json(a) as author,
        case when c.id is not null then row_to_json(c) else null end as cabal,
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
        (select count(*) from post_votes v where v.post_id = p.id and v.value = 1)::int as like_count,
        (select count(*) from post_reposts rp where rp.post_id = p.id)::int as repost_count,
        (select count(*) from post_views vw where vw.post_id = p.id)::int as view_count,
        coalesce((select sum(value) from post_votes v where v.post_id = p.id), 0)::int as score,
        (select count(*) from posts c where c.parent_id = p.id)::int as reply_count,
        coalesce((select value from post_votes v where v.post_id = p.id and v.profile_id = $1), 0)::int as my_vote,
        exists (select 1 from post_reposts rp where rp.post_id = p.id and rp.profile_id = $1) as my_reposted,
        exists (select 1 from post_bookmarks bm where bm.post_id = p.id and bm.profile_id = $1) as my_bookmarked
      from posts p
      left join profiles a on a.id = p.author_id
      left join cabals c on c.id = p.cabal_id
      left join markets m on m.id = p.market_id
      where ${conditions.join(" and ")}
      order by p.created_at desc
      limit 50`,
    params,
  );
  } catch (err) {
    console.error("[feed GET]", err);
    return NextResponse.json(
      { error: "Failed to load feed.", posts: [] },
      { status: 500, ...NO_STORE },
    );
  }

  posts = await attachPollData(posts, myId);
  posts = await attachThreadPreview(posts);

  return NextResponse.json({ posts }, NO_STORE);
}

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const threadParts = Array.isArray(body.thread_parts)
    ? body.thread_parts.map((s: unknown) => String(s).trim()).filter(Boolean)
    : [];
  const pollOptions = Array.isArray(body.poll_options)
    ? body.poll_options.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 4)
    : [];
  const isThread = threadParts.length >= 2;
  const isPoll = pollOptions.length >= 2;

  const content = isThread
    ? String(threadParts[0]).slice(0, 600)
    : String(body.content ?? "").trim();

  if (!content) {
    return NextResponse.json({ error: "Post content is required." }, { status: 400 });
  }
  if (!isThread && content.length > 600) {
    return NextResponse.json({ error: "Post must be 1-600 characters." }, { status: 400 });
  }

  const sentiment = ["bullish", "bearish", "neutral"].includes(body.sentiment) ? body.sentiment : "neutral";
  let cabalId = body.cabal_id ? String(body.cabal_id) : null;
  const imageUrl = body.image_url ? String(body.image_url) : null;
  const marketId = body.market_id ? String(body.market_id) : null;
  const parentId = body.parent_id ? String(body.parent_id) : null;
  const kind = parentId ? "post" : isThread ? "thread" : isPoll ? "poll" : "post";

  if (parentId) {
    const parent = await queryOne<{ cabal_id: string | null }>(
      "select cabal_id from posts where id = $1",
      [parentId],
    );
    if (!parent) return NextResponse.json({ error: "Parent post not found." }, { status: 404 });
    if (!cabalId && parent.cabal_id) cabalId = parent.cabal_id;
  }

  if (cabalId) {
    const member = await queryOne(
      "select 1 from cabal_members where cabal_id = $1 and profile_id = $2",
      [cabalId, ctx.profile.id],
    );
    if (!member) {
      return NextResponse.json({ error: "You must be a member of that cabal to post there." }, { status: 403 });
    }
  }

  if (marketId && body.market) {
    await upsertMarket(body.market as Market);
  }

  let post: Post | null;
  try {
    post = await queryOne<Post>(
      `insert into posts (author_id, content, sentiment, market_id, operation_id, cabal_id, bounty_id, parent_id, image_url, kind)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning *`,
      [
        ctx.profile.id,
        content,
        sentiment,
        marketId,
        body.operation_id ?? null,
        cabalId,
        body.bounty_id ?? null,
        parentId,
        imageUrl,
        kind,
      ],
    );
  } catch (err) {
    console.error("[feed POST insert]", err);
    return NextResponse.json({ error: "Failed to save post." }, { status: 500 });
  }

  if (!post) {
    return NextResponse.json({ error: "Failed to save post." }, { status: 500 });
  }

  if (isPoll && post && !parentId) {
    await query("insert into post_polls (post_id, options) values ($1, $2)", [
      post.id,
      JSON.stringify(pollOptions),
    ]);
  }

  if (isThread && post && !parentId) {
    for (let i = 1; i < threadParts.length; i++) {
      await query(
        `insert into posts (author_id, content, sentiment, cabal_id, parent_id, kind)
         values ($1, $2, $3, $4, $5, 'post')`,
        [ctx.profile.id, String(threadParts[i]).slice(0, 600), sentiment, cabalId, post.id],
      );
    }
  }

  await query("update profiles set influence = influence + 2 where id = $1", [ctx.profile.id]);

  const [enriched] = await attachThreadPreview(
    await attachPollData(
      [{
        ...post!,
        author: ctx.profile,
        like_count: 0,
        repost_count: 0,
        view_count: 0,
        score: 0,
        reply_count: parentId ? 0 : threadParts.length - 1,
        my_vote: 0,
        my_reposted: false,
        my_bookmarked: false,
      }],
      ctx.profile.id,
    ),
  );

  return NextResponse.json({ post: enriched });
}
