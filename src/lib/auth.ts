import { PrivyClient } from "@privy-io/server-auth";
import { query, queryOne } from "./db";
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

/** Resolve the profile id for the authed DID, or null (without creating). */
export async function getProfileId(request: Request): Promise<string | null> {
  const did = await verifyDid(request);
  if (!did) return null;
  const row = await queryOne<{ id: string }>("select id from profiles where privy_did = $1", [did]);
  return row?.id ?? null;
}

function randomCodename(): string {
  return "crow_" + Math.random().toString(36).slice(2, 8);
}

export type AuthedContext = {
  did: string;
  profile: Profile;
};

/** Resolve (and lazily provision) the profile for the authenticated user. */
export async function getAuthedProfile(request: Request): Promise<AuthedContext | null> {
  const did = await verifyDid(request);
  if (!did) return null;

  const existing = await queryOne<Profile>("select * from profiles where privy_did = $1", [did]);
  if (existing) return { did, profile: existing };

  const codename = randomCodename();
  const created = await queryOne<Profile>(
    `insert into profiles (privy_did, codename, avatar_seed)
     values ($1, $2, $2)
     on conflict (privy_did) do update set privy_did = excluded.privy_did
     returning *`,
    [did, codename],
  );
  return created ? { did, profile: created } : null;
}
