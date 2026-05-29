import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data: cabal, error } = await supabase
    .from("cabals")
    .select("*, cabal_members(role, profile:profiles(*))")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!cabal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: operations } = await supabase
    .from("operations")
    .select("*, market:markets(*)")
    .eq("cabal_id", cabal.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ cabal, operations: operations ?? [] });
}
