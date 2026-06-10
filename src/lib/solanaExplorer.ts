function envTrim(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

export function getSolanaNetwork(): string {
  return envTrim(process.env.SOLANA_NETWORK) ?? envTrim(process.env.NEXT_PUBLIC_SOLANA_NETWORK) ?? "mainnet-beta";
}

export function getSolanaRpcUrl(): string {
  return (
    envTrim(process.env.SOLANA_RPC_URL) ??
    envTrim(process.env.NEXT_PUBLIC_SOLANA_RPC_URL) ??
    "https://api.mainnet-beta.solana.com"
  );
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
