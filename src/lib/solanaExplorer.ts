export function getSolanaNetwork(): string {
  return process.env.SOLANA_NETWORK ?? process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "mainnet-beta";
}

export function solscanTxUrl(signature: string): string {
  const network = getSolanaNetwork();
  const base = "https://solscan.io/tx/";
  if (network === "devnet") return `${base}${signature}?cluster=devnet`;
  if (network === "testnet") return `${base}${signature}?cluster=testnet`;
  return `${base}${signature}`;
}

export function solscanAccountUrl(address: string): string {
  const network = getSolanaNetwork();
  const base = "https://solscan.io/account/";
  if (network === "devnet") return `${base}${address}?cluster=devnet`;
  if (network === "testnet") return `${base}${address}?cluster=testnet`;
  return `${base}${address}`;
}
