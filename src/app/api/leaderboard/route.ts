import { NextResponse } from "next/server";
import { isDbConfigured, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ operatives: [], cabals: [] });

  const operatives = await query(
    `select id, codename, display_name, avatar_seed, avatar_url, influence, coalesce(is_verified, false) as is_verified
       from profiles order by influence desc limit 25`,
  );

  const cabals = await query(
    `select c.id, c.slug, c.name, c.motto, c.emblem_seed,
        (select count(*) from cabal_members m where m.cabal_id = c.id)::int as member_count
       from cabals c
       order by member_count desc, c.created_at asc
       limit 25`,
  );

  return NextResponse.json({ operatives, cabals });
}
