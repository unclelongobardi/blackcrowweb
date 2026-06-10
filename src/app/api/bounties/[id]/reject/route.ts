import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const reason = body.reason ? String(body.reason).slice(0, 300) : "Proof rejected.";
  const participantId = body.participant_id ? String(body.participant_id) : null;

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the bounty creator can reject." }, { status: 403 });
  }

  if (participantId) {
    const participant = await queryOne<{ id: string; profile_id: string; status: string }>(
      "select id, profile_id, status from bounty_participants where id = $1 and bounty_id = $2",
      [participantId, id],
    );
    if (!participant || participant.status !== "submitted") {
      return NextResponse.json({ error: "No pending proof from that participant." }, { status: 400 });
    }

    await query(
      `update bounty_participants set
         status = 'rejected',
         reviewed_at = now(),
         proof_text = null,
         proof_media = '[]'::jsonb,
         submitted_at = null
       where id = $1`,
      [participant.id],
    );

    await notify(
      participant.profile_id,
      "bounty_rejected",
      `Proof rejected for "${bounty.title}": ${reason}`,
      `/app/bounties#bounty-${id}`,
    );
  } else if (bounty.helper_id) {
    await query(
      `update bounty_participants set
         status = 'rejected',
         reviewed_at = now(),
         proof_text = null,
         proof_media = '[]'::jsonb,
         submitted_at = null
       where bounty_id = $1 and profile_id = $2`,
      [id, bounty.helper_id],
    );
    await notify(
      bounty.helper_id,
      "bounty_rejected",
      `Proof rejected for "${bounty.title}": ${reason}`,
      `/app/bounties#bounty-${id}`,
    );
  } else {
    return NextResponse.json({ error: "Nothing to reject." }, { status: 400 });
  }

  const pending = await queryOne<{ n: number }>(
    "select count(*)::int as n from bounty_participants where bounty_id = $1 and status = 'submitted'",
    [id],
  );

  const nextStatus = (pending?.n ?? 0) > 0 ? "submitted" : "assigned";
  await query(
    `update bounties set status = $2, proof = null, submitted_at = case when $2 = 'submitted' then submitted_at else null end where id = $1`,
    [id, nextStatus],
  );

  const updated = await getBountyById(id, ctx.profile.id);
  return NextResponse.json({ rejected: true, status: nextStatus, bounty: updated });
}
