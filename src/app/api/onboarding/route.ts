import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODENAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(request: Request) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const codename = String(body.codename ?? "").trim();
  const display_name = body.display_name ? String(body.display_name).trim().slice(0, 60) : null;
  const bio = body.bio ? String(body.bio).trim().slice(0, 240) : null;
  const wallet_address = body.wallet_address ? String(body.wallet_address).trim() : ctx.profile.wallet_address;

  if (!CODENAME_RE.test(codename)) {
    return NextResponse.json(
      { error: "Codename must be 3-20 chars: letters, numbers or underscores." },
      { status: 400 },
    );
  }

  // Ensure codename is unique (excluding self).
  const { data: taken } = await ctx.supabase
    .from("profiles")
    .select("id")
    .eq("codename", codename)
    .neq("id", ctx.profile.id)
    .maybeSingle();
  if (taken) {
    return NextResponse.json({ error: "Codename already taken." }, { status: 409 });
  }

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update({
      codename,
      display_name,
      bio,
      wallet_address,
      avatar_seed: ctx.profile.avatar_seed ?? codename,
      is_onboarded: true,
    })
    .eq("id", ctx.profile.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
