import type { User, WalletWithMetadata } from "@privy-io/server-auth";
import { query } from "./db";
import { getPrivyClient, getIdentityTokenFromRequest } from "./auth";
import type { AuthedContext } from "./auth";

export function extractSolanaWalletAddresses(user: User): string[] {
  const addresses = user.linkedAccounts
    .filter(
      (account): account is WalletWithMetadata =>
        account.type === "wallet" && account.chainType === "solana",
    )
    .map((account) => account.address);

  if (user.wallet?.chainType === "solana" && user.wallet.address) {
    addresses.push(user.wallet.address);
  }

  return [...new Set(addresses)];
}

export async function fetchPrivyUser(request: Request, did: string): Promise<User | null> {
  const client = getPrivyClient();
  if (!client) return null;

  const idToken = getIdentityTokenFromRequest(request);
  if (idToken) {
    try {
      return await client.getUser({ idToken });
    } catch {
      /* fall back to DID lookup */
    }
  }

  try {
    return await client.getUserById(did);
  } catch {
    return null;
  }
}

export function pickVerifiedSolanaWallet(
  ownedAddresses: string[],
  preferred?: string | null,
): string | null {
  if (preferred) {
    const match = ownedAddresses.find((a) => a === preferred.trim());
    if (match) return match;
  }
  if (ownedAddresses.length === 1) return ownedAddresses[0];
  return null;
}

export type VerifiedWalletResult =
  | { ok: true; address: string; ownedAddresses: string[] }
  | { ok: false; error: string };

/** Resolve a Solana wallet linked to the user's Privy account; optionally sync profile. */
export async function resolveVerifiedSolanaWallet(
  request: Request,
  ctx: AuthedContext,
  preferred?: string | null,
  opts?: { syncProfile?: boolean },
): Promise<VerifiedWalletResult> {
  const client = getPrivyClient();
  if (!client) {
    return { ok: false, error: "Wallet verification is unavailable (Privy not configured)." };
  }

  const privyUser = await fetchPrivyUser(request, ctx.did);
  if (!privyUser) {
    return { ok: false, error: "Could not load linked wallets. Try again in a moment." };
  }

  const ownedAddresses = extractSolanaWalletAddresses(privyUser);
  if (!ownedAddresses.length) {
    return { ok: false, error: "Connect a Solana wallet to your account first." };
  }

  const address =
    pickVerifiedSolanaWallet(ownedAddresses, preferred) ??
    pickVerifiedSolanaWallet(ownedAddresses, ctx.profile.wallet_address);

  if (!address) {
    return {
      ok: false,
      error: "That wallet is not linked to your Privy account.",
    };
  }

  if (opts?.syncProfile !== false && address !== ctx.profile.wallet_address) {
    await query("update profiles set wallet_address = $1 where id = $2", [address, ctx.profile.id]);
    ctx.profile.wallet_address = address;
  }

  return { ok: true, address, ownedAddresses };
}
