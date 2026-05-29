import { NextResponse } from "next/server";
import { getAuthedProfile } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthedProfile(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const conviction = Math.min(100, Math.max(1, Number(body.conviction ?? 50) || 50));

  const { data: existing } = await ctx.supabase
    .from("operation_joins")
    .select("operation_id")
    .eq("operation_id", id)
    .eq("profile_id", ctx.profile.id)
    .maybeSingle();

  if (existing) {
    await ctx.supabase
      .from("operation_joins")
      .delete()
      .eq("operation_id", id)
      .eq("profile_id", ctx.profile.id);
    return NextResponse.json({ joined: false });
  }

  await ctx.supabase
    .from("operation_joins")
    .insert({ operation_id: id, profile_id: ctx.profile.id, conviction });

  // Reward: enlisting in an operation grants +1 influence.
  await ctx.supabase
    .from("profiles")
    .update({ influence: ctx.profile.influence + 1 })
    .eq("id", ctx.profile.id);

  return NextResponse.json({ joined: true });
}
