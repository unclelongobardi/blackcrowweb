/** VALORE — brand, token, and external links */

export const BRAND_NAME = "VALORE";
export const BRAND_FULL = "VALORE";
export const TOKEN_SYMBOL = "VALORE";
export const OFFICIAL_TOKEN_CA = "DxbU8EpEjHm1AWyzPtAXw3FGoGGo4PbNeJcmtaFQpump";
export const VALORE_LOGO_SRC = "/images/valore-logo.png";
export const VALORE_HERO_ILLUSTRATION_SRC = "/images/valore-hero-illustration.png";

/** Official X / Twitter profile */
export const TWITTER_HANDLE = "VALOREnet";
export const TWITTER_URL = `https://x.com/${TWITTER_HANDLE}`;

/** $VALORE SPL mint. NEXT_PUBLIC_TOKEN_CA can override per deployment. */
export const VALORE_TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() || OFFICIAL_TOKEN_CA;

export const TOKEN_CA = VALORE_TOKEN_MINT;

/** Dexscreener chart — defaults to Solana pair when CA is configured. */
export const DEXSCREENER_URL =
  process.env.NEXT_PUBLIC_DEXSCREENER_URL?.trim() ||
  (TOKEN_CA ? `https://dexscreener.com/solana/${TOKEN_CA}` : "https://dexscreener.com/solana");

export const PUMP_FUN_URL = TOKEN_CA ? `https://pump.fun/coin/${TOKEN_CA}` : "https://pump.fun";

export const SOLSCAN_TOKEN_URL = TOKEN_CA ? `https://solscan.io/token/${TOKEN_CA}` : "https://solscan.io";

export const OFFICIAL_CODENAME = "valore_official";
export const OFFICIAL_CABAL_SLUG = "valore-official";
