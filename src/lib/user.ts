import type { User } from "@privy-io/react-auth";

export function truncateAddress(address?: string | null, size = 4): string {
  if (!address) return "";
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

/** Best-effort human-readable handle for the current user. */
export function getUserHandle(user: User | null | undefined): string {
  if (!user) return "anon";
  if (user.email?.address) return user.email.address;
  if (user.google?.email) return user.google.email;
  if (user.twitter?.username) return `@${user.twitter.username}`;
  if (user.discord?.username) return user.discord.username;
  if (user.farcaster?.username) return `@${user.farcaster.username}`;
  if (user.wallet?.address) return truncateAddress(user.wallet.address);
  return "anon";
}

/** Two-letter avatar initials derived from the handle. */
export function getUserInitials(user: User | null | undefined): string {
  const handle = getUserHandle(user).replace(/^@/, "");
  const clean = handle.replace(/[^a-zA-Z0-9]/g, "");
  return (clean.slice(0, 2) || "BC").toUpperCase();
}

export type LinkedAccountSummary = {
  type: string;
  label: string;
  value: string;
};

export function getLinkedAccounts(user: User | null | undefined): LinkedAccountSummary[] {
  if (!user) return [];
  const out: LinkedAccountSummary[] = [];
  if (user.email?.address) out.push({ type: "email", label: "Email", value: user.email.address });
  if (user.wallet?.address)
    out.push({ type: "wallet", label: "Wallet", value: truncateAddress(user.wallet.address, 6) });
  if (user.google?.email) out.push({ type: "google", label: "Google", value: user.google.email });
  if (user.twitter?.username)
    out.push({ type: "twitter", label: "X / Twitter", value: `@${user.twitter.username}` });
  if (user.discord?.username)
    out.push({ type: "discord", label: "Discord", value: user.discord.username });
  if (user.farcaster?.username)
    out.push({ type: "farcaster", label: "Farcaster", value: `@${user.farcaster.username}` });
  return out;
}
