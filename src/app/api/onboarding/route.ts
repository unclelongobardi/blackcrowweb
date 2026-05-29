import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODENAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const codename = String(body.codename ?? "").trim();
  const displayName = body.display_name ? String(body.display_name).trim().slice(0, 60) : null;
  const bio = body.bio ? String(body.bio).trim().slice(0, 240) : null;
  const walletAddress = body.wallet_address ? String(body.wallet_address).trim() : ctx.profile.wallet_address;

  if (!CODENAME_RE.test(codename)) {
    return NextResponse.json(
      { error: "Codename must be 3-20 chars: letters, numbers or underscores." },
      { status: 400 },
    );
  }

  const taken = await queryOne<{ id: string }>(
    "select id from profiles where codename = $1 and id <> $2",
    [codename, ctx.profile.id],
  );
  if (taken) return NextResponse.json({ error: "Codename already taken." }, { status: 409 });

  const profile = await queryOne<Profile>(
    `update profiles
       set codename = $1, display_name = $2, bio = $3, wallet_address = $4,
           avatar_seed = coalesce(avatar_seed, $1), is_onboarded = true
     where id = $5
     returning *`,
    [codename, displayName, bio, walletAddress, ctx.profile.id],
  );

  return NextResponse.json({ profile });
}
