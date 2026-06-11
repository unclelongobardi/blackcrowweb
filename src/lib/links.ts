/** Official BLACKCROW X / Twitter profile */
export const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || "https://x.com/blkcrow_ofc";

/** Official $CROW SPL mint on Solana (override via NEXT_PUBLIC_TOKEN_CA). */
export const CROW_TOKEN_MINT = "GprwzJHB68xyP3mN2REyQyTraWjdfFMKAwdtF3mZpump";

export const TOKEN_CA = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() || CROW_TOKEN_MINT;

/** Dexscreener chart — defaults to Solana pair when CA is configured. */
export const DEXSCREENER_URL =
  process.env.NEXT_PUBLIC_DEXSCREENER_URL?.trim() ||
  (TOKEN_CA ? `https://dexscreener.com/solana/${TOKEN_CA}` : "https://dexscreener.com/solana");

export const PUMP_FUN_URL = TOKEN_CA ? `https://pump.fun/coin/${TOKEN_CA}` : "https://pump.fun";

export const SOLSCAN_TOKEN_URL = TOKEN_CA ? `https://solscan.io/token/${TOKEN_CA}` : "https://solscan.io";
