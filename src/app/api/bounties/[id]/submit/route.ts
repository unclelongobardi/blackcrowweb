import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { isBountyExpired } from "@/lib/bountyRules";
import { query, queryOne } from "@/lib/db";
import { notify } from "@/lib/notifications";
import type { BountyProofMedia } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseMedia(raw: unknown): BountyProofMedia[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is BountyProofMedia =>
        !!m &&
        typeof m === "object" &&
        (m as BountyProofMedia).type &&
        typeof (m as BountyProofMedia).url === "string",
    )
    .slice(0, 6)
    .map((m) => ({
      type: m.type === "video" ? "video" : "image",
      url: String(m.url).slice(0, 12_000_000),
    }));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const proof = String(body.proof ?? "").trim();
  const media = parseMedia(body.media);
  const videoUrl = body.video_url ? String(body.video_url).trim().slice(0, 500) : "";

  if (videoUrl) {
    media.push({ type: "video", url: videoUrl });
  }

  if (proof.length < 10 && media.length === 0) {
    return NextResponse.json(
      { error: "Add a description (10+ chars) and/or photos or video proof." },
      { status: 400 },
    );
  }

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (isBountyExpired(bounty)) {
    return NextResponse.json({ error: "This bounty has expired." }, { status: 400 });
  }

  const participant = await queryOne<{ id: string; status: string }>(
    "select id, status from bounty_participants where bounty_id = $1 and profile_id = $2",
    [id, ctx.profile.id],
  );
  if (!participant) {
    return NextResponse.json({ error: "Accept the bounty before submitting proof." }, { status: 403 });
  }
  if (participant.status === "submitted") {
    return NextResponse.json({ error: "Your proof is already under review." }, { status: 400 });
  }
  if (participant.status === "approved") {
    return NextResponse.json({ error: "You were already paid for this bounty." }, { status: 400 });
  }

  await query(
    `update bounty_participants set
       status = 'submitted',
       proof_text = $2,
       proof_media = $3::jsonb,
       submitted_at = now()
     where id = $1`,
    [participant.id, proof.slice(0, 2000) || null, JSON.stringify(media)],
  );

  await query(
    `update bounties set status = 'submitted', proof = $2, submitted_at = now() where id = $1`,
    [id, proof.slice(0, 2000) || `[media proof from ${ctx.profile.codename}]`],
  );

  if (bounty.created_by) {
    await notify(
      bounty.created_by,
      "bounty_submitted",
      `${ctx.profile.codename} submitted proof for: ${bounty.title}`,
      `/app/bounties#bounty-${id}`,
    );
  }

  const updated = await getBountyById(id, ctx.profile.id);
  return NextResponse.json({ submitted: true, status: "submitted", bounty: updated });
}
