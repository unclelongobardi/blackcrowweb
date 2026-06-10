import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { slug } = await params;
  const ctx = await getAuthedProfile(_request);
  const myId = ctx?.profile.id ?? null;

  const cabal = await queryOne(
    `select c.*,
       (select count(*) from cabal_members m where m.cabal_id = c.id)::int as member_count,
       coalesce(
         (select json_agg(json_build_object('role', m.role, 'profile', row_to_json(p)) order by m.joined_at)
            from cabal_members m join profiles p on p.id = m.profile_id
            where m.cabal_id = c.id),
         '[]'
       ) as members
     from cabals c where c.slug = $1`,
    [slug],
  );
  if (!cabal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember = myId
    ? !!(await queryOne("select 1 from cabal_members where cabal_id = $1 and profile_id = $2", [
        cabal.id,
        myId,
      ]))
    : false;

  if (cabal.visibility === "private" && !isMember) {
    return NextResponse.json({ error: "Private cabal." }, { status: 403 });
  }

  const isLeader = myId
    ? !!(await queryOne(
        "select 1 from cabal_members where cabal_id = $1 and profile_id = $2 and role = 'leader'",
        [cabal.id, myId],
      ))
    : false;

  const posts = isMember
    ? await query(
        `select p.*, row_to_json(a.*) as author
          from posts p
          join profiles a on a.id = p.author_id
          where p.parent_id is null and p.cabal_id = $1
          order by p.created_at desc
          limit 15`,
        [cabal.id],
      )
    : [];

  return NextResponse.json({ cabal: { ...cabal, is_member: isMember, is_leader: isLeader }, posts });
}
