import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MessageRow = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  sender?: Profile;
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const member = await queryOne(
    "select 1 from dm_participants where conversation_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );
  if (!member) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const messages = await query<MessageRow>(
    `select m.*, row_to_json(p.*) as sender
      from dm_messages m
      left join profiles p on p.id = m.sender_id
      where m.conversation_id = $1
      order by m.created_at asc
      limit 100`,
    [id],
  );

  await query(
    "update dm_participants set last_read_at = now() where conversation_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );

  const other = await queryOne<Profile>(
    `select p.* from dm_participants dp
      join profiles p on p.id = dp.profile_id
      where dp.conversation_id = $1 and dp.profile_id != $2`,
    [id, ctx.profile.id],
  );

  return NextResponse.json({ messages, other });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const text = String(body.body ?? "").trim();
  if (!text) return NextResponse.json({ error: "Empty message." }, { status: 400 });

  const member = await queryOne(
    "select 1 from dm_participants where conversation_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );
  if (!member) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const msg = await queryOne(
    "insert into dm_messages (conversation_id, sender_id, body) values ($1, $2, $3) returning *",
    [id, ctx.profile.id, text.slice(0, 2000)],
  );

  await query("update dm_conversations set updated_at = now() where id = $1", [id]);

  const other = await queryOne<{ id: string }>(
    "select profile_id as id from dm_participants where conversation_id = $1 and profile_id != $2",
    [id, ctx.profile.id],
  );
  if (other) {
    await notify(other.id, "dm", `New direct message from @${ctx.profile.codename}`, `/app/messages?c=${id}`);
  }

  return NextResponse.json({ message: msg });
}
