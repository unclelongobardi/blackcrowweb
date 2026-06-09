import { NextResponse } from "next/server";
import { getAuthedProfile, getProfileId } from "@/lib/auth";
import { listBounties } from "@/lib/bounties";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { solToLamports } from "@/lib/solana";
import type { Bounty } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ bounties: [] });
  const myId = await getProfileId(request);
  const status = new URL(request.url).searchParams.get("status") ?? undefined;
  const mine = new URL(request.url).searchParams.get("mine") === "1";

  if (mine && myId) {
    const rows = await query<Bounty>(
      `select b.*,
          row_to_json(creator.*) as creator,
          row_to_json(helper.*) as helper,
          row_to_json(m.*) as market
        from bounties b
        left join profiles creator on creator.id = b.created_by
        left join profiles helper on helper.id = b.helper_id
        left join markets m on m.id = b.market_id
        where b.created_by = $1 or b.helper_id = $1
        order by b.created_at desc`,
      [myId],
    );
    return NextResponse.json({
      bounties: rows.map((b) => ({
        ...b,
        my_role: b.created_by === myId ? "creator" : b.helper_id === myId ? "helper" : null,
      })),
    });
  }

  const bounties = await listBounties(myId, status);
  return NextResponse.json({ bounties });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const description = body.description ? String(body.description).trim() : null;
  const task = String(body.task ?? "").trim();
  const rewardSol = Number(body.reward_sol);
  const kind = ["action", "intel", "coord"].includes(body.kind) ? body.kind : "action";
  const market = body.market ?? null;

  if (title.length < 4) return NextResponse.json({ error: "Title must be at least 4 characters." }, { status: 400 });
  if (task.length < 10) return NextResponse.json({ error: "Describe what the helper must do (10+ chars)." }, { status: 400 });
  if (!Number.isFinite(rewardSol) || rewardSol < 0.01) {
    return NextResponse.json({ error: "Minimum reward is 0.01 SOL." }, { status: 400 });
  }
  if (rewardSol > 100) return NextResponse.json({ error: "Maximum reward is 100 SOL." }, { status: 400 });

  const lamports = solToLamports(rewardSol);
  const wallet = ctx.profile.wallet_address;

  // Cache market if provided
  if (market?.id && market?.question) {
    await query(
      `insert into markets (id, slug, question, category, image, yes_price, no_price, volume, end_date, url, last_synced)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
       on conflict (id) do update set yes_price=excluded.yes_price, no_price=excluded.no_price, volume=excluded.volume`,
      [
        market.id, market.slug ?? null, market.question, market.category ?? null,
        market.image ?? null, market.yes_price, market.no_price, market.volume,
        market.end_date ?? null, market.url ?? null,
      ],
    );
  }

  const bounty = await queryOne<Bounty>(
    `insert into bounties (
       created_by, market_id, title, description, task,
       reward_sol_lamports, reward_influence, kind, status, creator_wallet
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,'funding',$9)
     returning *`,
    [
      ctx.profile.id,
      market?.id ?? null,
      title,
      description,
      task,
      lamports.toString(),
      Math.min(500, Math.round(rewardSol * 10)),
      kind,
      wallet,
    ],
  );

  if (!bounty) return NextResponse.json({ error: "Failed to create bounty." }, { status: 500 });

  return NextResponse.json({ bounty: { ...bounty, my_role: "creator" as const } });
}
