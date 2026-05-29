import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import type { Bounty } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ bounties: [] });
  const myId = await getProfileId(request);

  const bounties = await query<Bounty>(
    `select b.*,
        case when $1::uuid is not null
          and exists (select 1 from bounty_claims bc where bc.bounty_id = b.id and bc.profile_id = $1)
          then true else false end as claimed
      from bounties b
      order by b.reward_influence desc`,
    [myId],
  );

  return NextResponse.json({ bounties });
}
