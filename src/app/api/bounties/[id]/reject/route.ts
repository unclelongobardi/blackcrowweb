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
  const reason = body.reason ? String(body.reason).slice(0, 300) : "Proof rejected.";

  const bounty = await getBountyById(id);
  if (!bounty) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (bounty.created_by !== ctx.profile.id) {
    return NextResponse.json({ error: "Only the bounty creator can reject." }, { status: 403 });
  }
  if (bounty.status !== "submitted") {
    return NextResponse.json({ error: "Nothing to reject." }, { status: 400 });
  }

  await query(
    `update bounties set status = 'assigned', proof = null, submitted_at = null where id = $1`,
    [id],
  );

  if (bounty.helper_id) {
    await notify(
      bounty.helper_id,
      "bounty_rejected",
      `Proof rejected for "${bounty.title}": ${reason}`,
      `/app/rewards`,
    );
  }

  return NextResponse.json({ rejected: true, status: "assigned" });
}
