import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getAuthedProfile(_request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const cabal = await queryOne<{ id: string }>("select id from cabals where slug = $1", [slug]);
  if (!cabal) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const leader = await queryOne(
    "select 1 from cabal_members where cabal_id = $1 and profile_id = $2 and role = 'leader'",
    [cabal.id, ctx.profile.id],
  );
  if (!leader) return NextResponse.json({ error: "Leader only." }, { status: 403 });

  const requests = await query<{ profile: Profile; created_at: string }>(
    `select row_to_json(p.*) as profile, r.created_at
      from cabal_join_requests r
      join profiles p on p.id = r.profile_id
      where r.cabal_id = $1 and r.status = 'pending'
      order by r.created_at asc`,
    [cabal.id],
  );

  return NextResponse.json({ requests });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const body = await request.json().catch(() => ({}));
  const profileId = String(body.profile_id ?? "");
  const action = body.action === "reject" ? "reject" : "approve";

  const cabal = await queryOne<{ id: string; name: string }>(
    "select id, name from cabals where slug = $1",
    [slug],
  );
  if (!cabal) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const leader = await queryOne(
    "select 1 from cabal_members where cabal_id = $1 and profile_id = $2 and role = 'leader'",
    [cabal.id, ctx.profile.id],
  );
  if (!leader) return NextResponse.json({ error: "Leader only." }, { status: 403 });

  const pending = await queryOne(
    "select 1 from cabal_join_requests where cabal_id = $1 and profile_id = $2 and status = 'pending'",
    [cabal.id, profileId],
  );
  if (!pending) return NextResponse.json({ error: "No pending request." }, { status: 404 });

  if (action === "approve") {
    await query("insert into cabal_members (cabal_id, profile_id, role) values ($1, $2, 'operative') on conflict do nothing", [
      cabal.id,
      profileId,
    ]);
    await notify(profileId, "cabal_approved", `You joined ${cabal.name}`, `/app/cabals/${slug}`);
  }

  await query(
    "update cabal_join_requests set status = $3 where cabal_id = $1 and profile_id = $2",
    [cabal.id, profileId, action === "approve" ? "approved" : "rejected"],
  );

  return NextResponse.json({ ok: true, action });
}
