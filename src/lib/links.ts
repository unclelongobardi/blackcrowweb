/** GLORIA — brand, token, and external links */

export const BRAND_NAME = "GLORIA";
export const BRAND_FULL = "GLORIA";
export const TOKEN_SYMBOL = "GLORIA";
export const OFFICIAL_TOKEN_CA = "DxbU8EpEjHm1AWyzPtAXw3FGoGGo4PbNeJcmtaFQpump";
export const GLORIA_LOGO_SRC = "/images/gloria-logo.png";
export const GLORIA_HERO_ILLUSTRATION_SRC = "/images/gloria-hero-illustration.png";
export const OFFICIAL_SITE_URL = "https://gloria.finance";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || OFFICIAL_SITE_URL;

/** Official X / Twitter profile */
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim() || "GLORIA";
export const TWITTER_URL = process.env.NEXT_PUBLIC_TWITTER_URL?.trim() || "";

/** $GLORIA SPL mint. NEXT_PUBLIC_TOKEN_CA can override per deployment. */
export const GLORIA_TOKEN_MINT = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() || OFFICIAL_TOKEN_CA;

export const TOKEN_CA = GLORIA_TOKEN_MINT;

/** Dexscreener chart — defaults to Solana pair when CA is configured. */
export const DEXSCREENER_URL =
  process.env.NEXT_PUBLIC_DEXSCREENER_URL?.trim() ||
  (TOKEN_CA ? `https://dexscreener.com/solana/${TOKEN_CA}` : "https://dexscreener.com/solana");

export const PUMP_FUN_URL = TOKEN_CA ? `https://pump.fun/coin/${TOKEN_CA}` : "https://pump.fun";

export const SOLSCAN_TOKEN_URL = TOKEN_CA ? `https://solscan.io/token/${TOKEN_CA}` : "https://solscan.io";

export const OFFICIAL_CODENAME = "gloria_official";
export const OFFICIAL_CABAL_SLUG = "gloria-official";
