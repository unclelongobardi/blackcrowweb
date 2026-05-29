import { NextResponse } from "next/server";
import { isDbConfigured, query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { slug } = await params;

  const cabal = await queryOne(
    `select c.*,
       coalesce(
         (select json_agg(json_build_object('role', m.role, 'profile', row_to_json(p)))
            from cabal_members m join profiles p on p.id = m.profile_id
            where m.cabal_id = c.id),
         '[]'
       ) as members
     from cabals c where c.slug = $1`,
    [slug],
  );
  if (!cabal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const operations = await query(
    `select o.*, case when m.id is not null then row_to_json(m) else null end as market
       from operations o left join markets m on m.id = o.market_id
       where o.cabal_id = $1 order by o.created_at desc`,
    [cabal.id],
  );

  return NextResponse.json({ cabal, operations });
}
