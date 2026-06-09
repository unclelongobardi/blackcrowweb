import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const cabal = await queryOne<{ id: string; visibility: string; name: string; created_by: string | null }>(
    "select id, visibility, name, created_by from cabals where slug = $1",
    [slug],
  );
  if (!cabal) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const existing = await queryOne(
    "select 1 from cabal_members where cabal_id = $1 and profile_id = $2",
    [cabal.id, ctx.profile.id],
  );

  if (existing) {
    const isLeader = await queryOne(
      "select 1 from cabal_members where cabal_id = $1 and profile_id = $2 and role = 'leader'",
      [cabal.id, ctx.profile.id],
    );
    if (isLeader) {
      return NextResponse.json({ error: "Leaders cannot leave their cabal." }, { status: 400 });
    }
    await query("delete from cabal_members where cabal_id = $1 and profile_id = $2", [
      cabal.id,
      ctx.profile.id,
    ]);
    return NextResponse.json({ joined: false, requested: false });
  }

  if (cabal.visibility === "private") {
    await query(
      `insert into cabal_join_requests (cabal_id, profile_id, status)
       values ($1, $2, 'pending')
       on conflict (cabal_id, profile_id) do update set status = 'pending'`,
      [cabal.id, ctx.profile.id],
    );
    if (cabal.created_by) {
      await notify(
        cabal.created_by,
        "cabal_request",
        `${ctx.profile.codename} requested to join ${cabal.name}`,
        `/app/cabals/${slug}`,
      );
    }
    return NextResponse.json({ joined: false, requested: true });
  }

  await query("insert into cabal_members (cabal_id, profile_id, role) values ($1, $2, 'operative')", [
    cabal.id,
    ctx.profile.id,
  ]);
  return NextResponse.json({ joined: true, requested: false });
}
