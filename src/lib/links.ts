/** VEXORA NETWORK — brand, token, and external links */

export const BRAND_NAME = "VEXORA";
export const BRAND_FULL = "VEXORA NETWORK";
export const TOKEN_SYMBOL = "VEXORA";
export const VEXORA_LOGO_SRC = "/images/vexora-logo.png";

/** Official X / Twitter profile */
export const TWITTER_URL =
  process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || "https://x.com/blkcrow_ofc";

/** $VEXORA SPL mint — set via NEXT_PUBLIC_TOKEN_CA when live. */
export const VEXORA_TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() || "";

export const TOKEN_CA = VEXORA_TOKEN_MINT;

/** Dexscreener chart — defaults to Solana pair when CA is configured. */
export const DEXSCREENER_URL =
  process.env.NEXT_PUBLIC_DEXSCREENER_URL?.trim() ||
  (TOKEN_CA ? `https://dexscreener.com/solana/${TOKEN_CA}` : "https://dexscreener.com/solana");

export const PUMP_FUN_URL = TOKEN_CA ? `https://pump.fun/coin/${TOKEN_CA}` : "https://pump.fun";

export const SOLSCAN_TOKEN_URL = TOKEN_CA ? `https://solscan.io/token/${TOKEN_CA}` : "https://solscan.io";

export const OFFICIAL_CODENAME = "vexora_official";
export const OFFICIAL_CABAL_SLUG = "vexora-official";
