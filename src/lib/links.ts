/** Official BLACKCROW X / Twitter profile */
export const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || "https://x.com/blkcrow_ofc";

/** $BLACKCROW SPL token mint (Solana). Shown as TBA until set in env. */
export const TOKEN_CA = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() || "";

/** Dexscreener chart — defaults to Solana pair when CA is configured. */
export const DEXSCREENER_URL =
  process.env.NEXT_PUBLIC_DEXSCREENER_URL?.trim() ||
  (TOKEN_CA ? `https://dexscreener.com/solana/${TOKEN_CA}` : "https://dexscreener.com/solana");
