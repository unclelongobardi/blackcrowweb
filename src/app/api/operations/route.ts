import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import type { Operation } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ operations: [] });
  const status = new URL(request.url).searchParams.get("status");

  const params: unknown[] = [];
  let where = "";
  if (status) {
    params.push(status);
    where = `where o.status = $${params.length}`;
  }

  const operations = await query<Operation>(
    `select o.*,
        case when m.id is not null then row_to_json(m) else null end as market,
        case when c.id is not null then row_to_json(c) else null end as cabal,
        case when a.id is not null then row_to_json(a) else null end as author,
        (select count(*) from operation_joins j where j.operation_id = o.id)::int as member_count
      from operations o
      left join markets m on m.id = o.market_id
      left join cabals c on c.id = o.cabal_id
      left join profiles a on a.id = o.created_by
      ${where}
      order by o.created_at desc
      limit 50`,
    params,
  );
  return NextResponse.json({ operations });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim().slice(0, 80);
  if (title.length < 4) return NextResponse.json({ error: "Title too short." }, { status: 400 });
  const targetSide = body.target_side === "NO" ? "NO" : "YES";

  let marketId: string | null = body.market_id ?? null;

  // Cache the Polymarket market so the operation can reference it.
  if (body.market?.id) {
    const m = body.market;
    marketId = String(m.id);
    await query(
      `insert into markets (id, slug, question, category, image, yes_price, no_price, volume, end_date, url, last_synced)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
       on conflict (id) do update set
         yes_price = excluded.yes_price, no_price = excluded.no_price,
         volume = excluded.volume, last_synced = now()`,
      [
        marketId,
        m.slug ?? null,
        m.question ?? title,
        m.category ?? null,
        m.image ?? null,
        m.yes_price ?? null,
        m.no_price ?? null,
        m.volume ?? null,
        m.end_date ?? null,
        m.url ?? null,
      ],
    );
  }

  const op = await queryOne<Operation>(
    `insert into operations (title, thesis, target_side, market_id, cabal_id, created_by, status)
     values ($1,$2,$3,$4,$5,$6,'active')
     returning *`,
    [
      title,
      body.thesis ? String(body.thesis).slice(0, 400) : null,
      targetSide,
      marketId,
      body.cabal_id ?? null,
      ctx.profile.id,
    ],
  );

  await query(
    "insert into operation_joins (operation_id, profile_id, conviction) values ($1, $2, 100)",
    [op!.id, ctx.profile.id],
  );
  // Reward: launching an operation grants +10 influence.
  await query("update profiles set influence = influence + 10 where id = $1", [ctx.profile.id]);

  return NextResponse.json({ operation: { ...op, member_count: 1, author: ctx.profile } });
}
