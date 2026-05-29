import { PrivyClient } from "@privy-io/server-auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabase";
import type { Profile } from "./types";

const APP_ID = process.env.PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;

let _privy: PrivyClient | null = null;
function privy(): PrivyClient | null {
  if (!APP_ID || !APP_SECRET) return null;
  if (!_privy) _privy = new PrivyClient(APP_ID, APP_SECRET);
  return _privy;
}

export function getTokenFromRequest(request: Request): string | undefined {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const cookieToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("privy-token="))
    ?.split("=")[1];
  return bearer || cookieToken;
}

/** Verify the Privy access token and return the user's DID, or null. */
export async function verifyDid(request: Request): Promise<string | null> {
  const client = privy();
  if (!client) return null;
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    const claims = await client.verifyAuthToken(token);
    return claims.userId;
  } catch {
    return null;
  }
}

function randomCodename(): string {
  return "crow_" + Math.random().toString(36).slice(2, 8);
}

export type AuthedContext = {
  did: string;
  profile: Profile;
  supabase: SupabaseClient;
};

/** Resolve (and lazily provision) the profile for the authenticated user. */
export async function getAuthedProfile(request: Request): Promise<AuthedContext | null> {
  const did = await verifyDid(request);
  if (!did) return null;
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("privy_did", did)
    .maybeSingle();

  if (existing) return { did, profile: existing as Profile, supabase };

  const codename = randomCodename();
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ privy_did: did, codename, avatar_seed: codename })
    .select("*")
    .single();

  if (error || !created) return null;
  return { did, profile: created as Profile, supabase };
}
