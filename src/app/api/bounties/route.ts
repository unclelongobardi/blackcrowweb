import { NextResponse } from "next/server";
import { verifyDid } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ bounties: [] });
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("bounties")
    .select("*")
    .order("reward_influence", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const did = await verifyDid(request);
  let claimedIds = new Set<string>();
  if (did) {
    const { data: me } = await supabase.from("profiles").select("id").eq("privy_did", did).maybeSingle();
    if (me) {
      const { data: claims } = await supabase
        .from("bounty_claims")
        .select("bounty_id")
        .eq("profile_id", me.id);
      claimedIds = new Set((claims ?? []).map((c) => c.bounty_id));
    }
  }

  const bounties = (data ?? []).map((b) => ({ ...b, claimed: claimedIds.has(b.id) }));
  return NextResponse.json({ bounties });
}
