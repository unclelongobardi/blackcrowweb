import { NextResponse } from "next/server";
import { getAuthedProfile, getProfileId } from "@/lib/auth";
import { getBountyById, listBounties } from "@/lib/bounties";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { helperInfluenceFromLamports } from "@/lib/bountyInfluence";
import { isValidBountyRewardSol, MAX_BOUNTY_REWARD_SOL, MIN_BOUNTY_REWARD_SOL } from "@/lib/bountyRules";
import { solToLamports } from "@/lib/solanaFormat";
import type { Bounty } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ bounties: [] });
  const myId = await getProfileId(request);
  const status = new URL(request.url).searchParams.get("status") ?? undefined;
  const mine = new URL(request.url).searchParams.get("mine") === "1";

  if (mine && myId) {
    const rows = await query<{ id: string }>(
      `select b.id from bounties b
        where b.created_by = $1
           or b.helper_id = $1
           or exists (select 1 from bounty_participants bp where bp.bounty_id = b.id and bp.profile_id = $1)
        order by b.created_at desc`,
      [myId],
    );
    const bounties = (
      await Promise.all(rows.map((r) => getBountyById(r.id, myId)))
    ).filter((b): b is Bounty => !!b);
    return NextResponse.json({ bounties });
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
  if (!isValidBountyRewardSol(rewardSol)) {
    return NextResponse.json(
      { error: `Reward must be between ${MIN_BOUNTY_REWARD_SOL} and ${MAX_BOUNTY_REWARD_SOL} SOL.` },
      { status: 400 },
    );
  }

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

  const expiresAt = market?.end_date ?? null;

  const bounty = await queryOne<Bounty>(
    `insert into bounties (
       created_by, market_id, title, description, task,
       reward_sol_lamports, reward_influence, kind, status, creator_wallet, expires_at
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,'funding',$9,$10)
     returning *`,
    [
      ctx.profile.id,
      market?.id ?? null,
      title,
      description,
      task,
      lamports.toString(),
      helperInfluenceFromLamports(lamports),
      kind,
      wallet,
      expiresAt,
    ],
  );

  if (!bounty) return NextResponse.json({ error: "Failed to create bounty." }, { status: 500 });

  return NextResponse.json({ bounty: { ...bounty, my_role: "creator" as const } });
}
