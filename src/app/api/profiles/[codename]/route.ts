import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import { toPublicProfile } from "@/lib/profilePublic";
import type { Post, Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ codename: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  const { codename } = await params;
  const myId = await getProfileId(request);

  const profile = await queryOne<Profile>(
    "select * from profiles where lower(codename) = lower($1)",
    [codename],
  );
  if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const stats = await queryOne<{
    posts: string;
    cabals: string;
    bounties_posted: string;
    bounties_done: string;
    followers: string;
    following: string;
  }>(
    `select
       (select count(*) from posts where author_id = $1) as posts,
       (select count(*) from cabal_members where profile_id = $1) as cabals,
       (select count(*) from bounties where created_by = $1) as bounties_posted,
       (select count(*) from bounties where helper_id = $1 and status = 'paid') as bounties_done,
       (select count(*) from follows where following_id = $1) as followers,
       (select count(*) from follows where follower_id = $1) as following`,
    [profile.id],
  );

  const posts = await query<Post>(
    `select p.*,
        row_to_json(a.*) as author,
        (select coalesce(sum(v.value),0) from post_votes v where v.post_id = p.id) as score
      from posts p
      left join profiles a on a.id = p.author_id
      where p.author_id = $1 and p.parent_id is null
      order by p.created_at desc
      limit 20`,
    [profile.id],
  );

  let is_following = false;
  if (myId) {
    const f = await queryOne("select 1 from follows where follower_id = $1 and following_id = $2", [
      myId,
      profile.id,
    ]);
    is_following = !!f;
  }

  const rank = await queryOne<{ rank: string }>(
    `select count(*) + 1 as rank from profiles where influence > $1`,
    [profile.influence],
  );

  return NextResponse.json({
    profile: toPublicProfile(profile, { isSelf: myId === profile.id }),
    stats: {
      posts: Number(stats?.posts ?? 0),
      cabals: Number(stats?.cabals ?? 0),
      bounties_posted: Number(stats?.bounties_posted ?? 0),
      bounties_done: Number(stats?.bounties_done ?? 0),
      followers: Number(stats?.followers ?? 0),
      following: Number(stats?.following ?? 0),
      rank: Number(rank?.rank ?? 0),
    },
    posts,
    is_following,
    is_self: myId === profile.id,
  });
}
