import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { getBountyById } from "@/lib/bounties";
import { query } from "@/lib/db";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const proof = String(body.proof ?? "").trim();
  if (proof.length < 10) {
    return NextResponse.json({ error: "Submit proof of completion (10+ chars, links welcome)." }, { status: 400 });
  }

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.helper_id !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the assigned helper can submit proof." }, { status: 403 });
  }
  if (bounty.status !== "assigned") {
    return NextResponse.json({ error: "Bounty is not awaiting proof." }, { status: 400 });
  }

  await query(
    `update bounties set status = 'submitted', proof = $2, submitted_at = now() where id = $1`,
    [id, proof.slice(0, 2000)],
  );

  if (bounty.created_by) {
    await notify(
      bounty.created_by,
      "bounty_submitted",
      `${ctx.profile.codename} submitted proof for: ${bounty.title}`,
      `/app/rewards`,
    );
  }

  return NextResponse.json({ submitted: true, status: "submitted" });
}
