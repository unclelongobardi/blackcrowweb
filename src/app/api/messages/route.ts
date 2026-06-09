import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isDbConfigured, query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConversationRow = {
  id: string;
  updated_at: string;
  other: Profile;
  last_body: string | null;
  last_at: string | null;
  unread: boolean;
};

export async function GET(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ conversations: [] });

  const conversations = await query<ConversationRow>(
    `select c.id, c.updated_at,
        row_to_json(p.*) as other,
        (select body from dm_messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_body,
        (select created_at from dm_messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_at,
        exists (
          select 1 from dm_messages m
          where m.conversation_id = c.id
            and m.sender_id != $1
            and m.created_at > coalesce(me.last_read_at, '1970-01-01')
        ) as unread
      from dm_conversations c
      join dm_participants me on me.conversation_id = c.id and me.profile_id = $1
      join dm_participants them on them.conversation_id = c.id and them.profile_id != $1
      join profiles p on p.id = them.profile_id
      order by c.updated_at desc
      limit 40`,
    [ctx.profile.id],
  );

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const toCodename = String(body.to_codename ?? "").trim();
  const text = String(body.body ?? "").trim();
  if (!toCodename) return NextResponse.json({ error: "Recipient required." }, { status: 400 });
  if (text.length < 1) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Message too long." }, { status: 400 });

  const recipient = await queryOne<{ id: string; codename: string }>(
    "select id, codename from profiles where lower(codename) = lower($1)",
    [toCodename],
  );
  if (!recipient) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (recipient.id === ctx.profile.id) {
    return NextResponse.json({ error: "Cannot message yourself." }, { status: 400 });
  }

  let conv = await queryOne<{ id: string }>(
    `select c.id from dm_conversations c
      join dm_participants p1 on p1.conversation_id = c.id and p1.profile_id = $1
      join dm_participants p2 on p2.conversation_id = c.id and p2.profile_id = $2`,
    [ctx.profile.id, recipient.id],
  );

  if (!conv) {
    conv = await queryOne<{ id: string }>(
      "insert into dm_conversations default values returning id",
      [],
    );
    await query(
      "insert into dm_participants (conversation_id, profile_id) values ($1, $2), ($1, $3)",
      [conv!.id, ctx.profile.id, recipient.id],
    );
  }

  const msg = await queryOne<{ id: string; created_at: string }>(
    "insert into dm_messages (conversation_id, sender_id, body) values ($1, $2, $3) returning id, created_at",
    [conv!.id, ctx.profile.id, text],
  );

  await query("update dm_conversations set updated_at = now() where id = $1", [conv!.id]);

  await notify(
    recipient.id,
    "dm",
    `New message from ${ctx.profile.codename}`,
    `/app/messages?c=${conv!.id}`,
  );

  return NextResponse.json({ conversation_id: conv!.id, message: msg });
}
