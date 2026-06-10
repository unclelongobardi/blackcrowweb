import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";
import { isAvatarId, DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { queryOne } from "@/lib/db";
import { resolveVerifiedSolanaWallet } from "@/lib/privyWallets";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODENAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const codename = String(body.codename ?? "").trim().toLowerCase();
  const displayName = body.display_name ? String(body.display_name).trim().slice(0, 60) : null;
  const bio = body.bio ? String(body.bio).trim().slice(0, 240) : null;
  const walletAddressRaw = body.wallet_address ? String(body.wallet_address).trim() : ctx.profile.wallet_address;
  let walletAddress = walletAddressRaw;
  if (walletAddressRaw) {
    const verified = await resolveVerifiedSolanaWallet(request, ctx, walletAddressRaw, {
      syncProfile: false,
    });
    if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: 400 });
    walletAddress = verified.address;
  }
  const avatarRaw = body.avatar_seed ? String(body.avatar_seed).trim() : null;

  if (avatarRaw && !isAvatarId(avatarRaw)) {
    return NextResponse.json({ error: "Invalid avatar selection." }, { status: 400 });
  }

  const usePreset = body.avatar_mode === "preset" || (avatarRaw && isAvatarId(avatarRaw) && body.avatar_mode !== "custom");
  const avatarSeed =
    usePreset && avatarRaw
      ? avatarRaw
      : usePreset
        ? ctx.profile.is_onboarded && isAvatarId(ctx.profile.avatar_seed)
          ? ctx.profile.avatar_seed
          : DEFAULT_AVATAR_ID
        : ctx.profile.avatar_seed === "custom"
          ? "custom"
          : avatarRaw && isAvatarId(avatarRaw)
            ? avatarRaw
            : DEFAULT_AVATAR_ID;
  const avatarUrl = usePreset ? null : ctx.profile.avatar_url;

  if (!CODENAME_RE.test(codename)) {
    return NextResponse.json(
      { error: "Codename must be 3-20 chars: letters, numbers or underscores." },
      { status: 400 },
    );
  }

  const taken = await queryOne<{ id: string }>(
    "select id from profiles where lower(codename) = lower($1) and id <> $2",
    [codename, ctx.profile.id],
  );
  if (taken) return NextResponse.json({ error: "Codename already taken." }, { status: 409 });

  const profile = await queryOne<Profile>(
    `update profiles
       set codename = $1, display_name = $2, bio = $3, wallet_address = $4,
           avatar_seed = $5, avatar_url = $6, is_onboarded = true
     where id = $7
     returning *`,
    [codename, displayName, bio, walletAddress, avatarSeed, avatarUrl, ctx.profile.id],
  );

  return NextResponse.json({ profile });
}
