import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, queryOne } from "@/lib/db";

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
    operations: string;
    posts: string;
    rank: string;
  }>(
    `select
       (select count(*) from cabal_members where profile_id = $1) as cabals,
       (select count(*) from operation_joins where profile_id = $1) as operations,
       (select count(*) from posts where author_id = $1) as posts,
       (select count(*) from profiles where influence > $2) + 1 as rank`,
    [profile.id, profile.influence],
  );

  return NextResponse.json({
    authenticated: true,
    profile,
    stats: {
      cabals: Number(stats?.cabals ?? 0),
      operations: Number(stats?.operations ?? 0),
      posts: Number(stats?.posts ?? 0),
      rank: Number(stats?.rank ?? 1),
    },
  });
}
