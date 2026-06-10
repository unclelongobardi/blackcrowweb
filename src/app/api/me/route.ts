import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ authenticated: false, error: "Backend not configured." }, { status: 503 });
  }
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ authenticated: false }, { status: 401 });

  const { profile } = ctx;
  const stats = await queryOne<{
    cabals: string;
    bounties_posted: string;
    bounties_done: string;
    posts: string;
    rank: string;
  }>(
    `select
       (select count(*) from cabal_members where profile_id = $1) as cabals,
       (select count(*) from bounties where created_by = $1) as bounties_posted,
       (select count(*) from bounties where helper_id = $1 and status = 'paid') as bounties_done,
       (select count(*) from posts where author_id = $1) as posts,
       (select count(*) from profiles where influence > $2) + 1 as rank`,
    [profile.id, profile.influence],
  );

  const memberCabals = await query<{
    id: string;
    slug: string;
    name: string;
    emblem_seed: string | null;
    kind: string | null;
    visibility: string | null;
  }>(
    `select c.id, c.slug, c.name, c.emblem_seed, c.kind, c.visibility
       from cabal_members m
       join cabals c on c.id = m.cabal_id
      where m.profile_id = $1
      order by m.joined_at desc`,
    [profile.id],
  );

  return NextResponse.json({
    authenticated: true,
    profile,
    stats: {
      cabals: Number(stats?.cabals ?? 0),
      bounties_posted: Number(stats?.bounties_posted ?? 0),
      bounties_done: Number(stats?.bounties_done ?? 0),
      posts: Number(stats?.posts ?? 0),
      rank: Number(stats?.rank ?? 1),
    },
    member_cabals: memberCabals,
  });
}
