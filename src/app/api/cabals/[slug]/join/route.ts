import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const cabal = await queryOne<{ id: string }>("select id from cabals where slug = $1", [slug]);
  if (!cabal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await queryOne(
    "select 1 from cabal_members where cabal_id = $1 and profile_id = $2",
    [cabal.id, ctx.profile.id],
  );

  if (existing) {
    await query("delete from cabal_members where cabal_id = $1 and profile_id = $2", [
      cabal.id,
      ctx.profile.id,
    ]);
    return NextResponse.json({ joined: false });
  }

  await query("insert into cabal_members (cabal_id, profile_id, role) values ($1, $2, 'operative')", [
    cabal.id,
    ctx.profile.id,
  ]);
  return NextResponse.json({ joined: true });
}
