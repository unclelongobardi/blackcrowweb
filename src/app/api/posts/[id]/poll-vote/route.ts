import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const optionIndex = Number(body.option_index);

  const poll = await queryOne<{ options: string[] }>(
    "select options from post_polls where post_id = $1",
    [id],
  );
  if (!poll) return NextResponse.json({ error: "Poll not found." }, { status: 404 });
  const options = Array.isArray(poll.options) ? poll.options : [];
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
    return NextResponse.json({ error: "Invalid option." }, { status: 400 });
  }

  await query(
    `insert into post_poll_votes (post_id, profile_id, option_index)
     values ($1, $2, $3)
     on conflict (post_id, profile_id) do update set option_index = excluded.option_index`,
    [id, ctx.profile.id, optionIndex],
  );

  const counts = await query<{ option_index: number; count: string }>(
    `select option_index, count(*)::text as count
       from post_poll_votes where post_id = $1 group by option_index`,
    [id],
  );

  const tally = options.map((_, i) => {
    const row = counts.find((c) => c.option_index === i);
    return Number(row?.count ?? 0);
  });

  return NextResponse.json({ option_index: optionIndex, counts: tally });
}
