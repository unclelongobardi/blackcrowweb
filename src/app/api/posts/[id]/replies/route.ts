import { NextResponse } from "next/server";
import { getProfileId } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import type { Post } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ replies: [] });
  const { id } = await params;
  const myId = await getProfileId(_request);

  const replies = await query<Post>(
    `select p.*, row_to_json(a) as author
       from posts p
       left join profiles a on a.id = p.author_id
      where p.parent_id = $1
      order by p.created_at asc`,
    [id],
  );

  return NextResponse.json({ replies, my_id: myId });
}
