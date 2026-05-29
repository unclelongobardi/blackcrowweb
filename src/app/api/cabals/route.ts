import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
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

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ cabals: [] });
  const cabals = await query<Cabal>(
    `select c.*, (select count(*) from cabal_members m where m.cabal_id = c.id)::int as member_count
       from cabals c
       order by c.created_at asc`,
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

  const exists = await queryOne<{ id: string }>("select id from cabals where slug = $1", [slug]);
  if (exists) return NextResponse.json({ error: "A cabal with that name exists." }, { status: 409 });

  const cabal = await queryOne<Cabal>(
    `insert into cabals (slug, name, motto, description, emblem_seed, created_by)
     values ($1, $2, $3, $4, $1, $5) returning *`,
    [
      slug,
      name,
      body.motto ? String(body.motto).slice(0, 80) : null,
      body.description ? String(body.description).slice(0, 280) : null,
      ctx.profile.id,
    ],
  );

  await query(
    "insert into cabal_members (cabal_id, profile_id, role) values ($1, $2, 'leader')",
    [cabal!.id, ctx.profile.id],
  );
  // Reward: founding a cabal grants +20 influence.
  await query("update profiles set influence = influence + 20 where id = $1", [ctx.profile.id]);

  return NextResponse.json({ cabal: { ...cabal, member_count: 1 } });
}
