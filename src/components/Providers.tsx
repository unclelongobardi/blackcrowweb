"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import type { ReactNode } from "react";

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const solanaConnectors = toSolanaWalletConnectors();

export default function Providers({ children }: { children: ReactNode }) {
  // Fail open during local dev if env is missing, so the marketing page still renders.
  if (!APP_ID) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[VEXORA] NEXT_PUBLIC_PRIVY_APP_ID is not set — auth disabled.");
    }
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={APP_ID}
      clientId={CLIENT_ID}
      config={{
        // Login is restricted to Solana wallets — only Phantom and Solflare.
        loginMethods: ["wallet"],
        appearance: {
          theme: "light",
          walletChainType: "solana-only",
          walletList: ["phantom", "solflare"],
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
        embeddedWallets: {
          solana: { createOnLogin: "off" },
        },
        walletConnectCloudProjectId: WC_PROJECT_ID,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
