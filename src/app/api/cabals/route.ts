import { NextResponse } from "next/server";
import { getAuthedProfile, getProfileId } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import type { Cabal } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ cabals: [] });
  const myId = await getProfileId(request);
  const kind = new URL(request.url).searchParams.get("kind");
  const visibility = new URL(request.url).searchParams.get("visibility");

  const params: unknown[] = [myId];
  let where = `where c.visibility = 'public' or exists (
    select 1 from cabal_members m where m.cabal_id = c.id and m.profile_id = $1
  )`;
  if (kind && kind !== "all") {
    params.push(kind);
    where += ` and c.kind = $${params.length}`;
  }
  if (visibility && visibility !== "all") {
    params.push(visibility);
    where += ` and c.visibility = $${params.length}`;
  }

  const cabals = await query<Cabal & { is_member: boolean; pending_request: boolean }>(
    `select c.*,
        (select count(*) from cabal_members m where m.cabal_id = c.id)::int as member_count,
        exists (select 1 from cabal_members m where m.cabal_id = c.id and m.profile_id = $1) as is_member,
        exists (
          select 1 from cabal_join_requests r
          where r.cabal_id = c.id and r.profile_id = $1 and r.status = 'pending'
        ) as pending_request
      from cabals c
      ${where}
      order by c.created_at desc`,
    params,
  );

  return NextResponse.json({ cabals });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, 50);
  if (name.length < 3) return NextResponse.json({ error: "Name too short." }, { status: 400 });
  const slug = slugify(name);
  const visibility = body.visibility === "private" ? "private" : "public";
  const kind = ["tipsters", "manipulation", "discussion"].includes(body.kind) ? body.kind : "discussion";

  const exists = await queryOne<{ id: string }>("select id from cabals where slug = $1", [slug]);
  if (exists) return NextResponse.json({ error: "A cabal with that name exists." }, { status: 409 });

  const cabal = await queryOne<Cabal>(
    `insert into cabals (slug, name, motto, description, emblem_seed, created_by, visibility, kind)
     values ($1, $2, $3, $4, $1, $5, $6, $7) returning *`,
    [
      slug,
      name,
      body.motto ? String(body.motto).slice(0, 80) : null,
      body.description ? String(body.description).slice(0, 280) : null,
      ctx.profile.id,
      visibility,
      kind,
    ],
  );

  await query(
    "insert into cabal_members (cabal_id, profile_id, role) values ($1, $2, 'leader')",
    [cabal!.id, ctx.profile.id],
  );
  await query("update profiles set influence = influence + 20 where id = $1", [ctx.profile.id]);

  return NextResponse.json({ cabal: { ...cabal, member_count: 1, is_member: true } });
}
