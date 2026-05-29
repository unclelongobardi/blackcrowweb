"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export default function Providers({ children }: { children: ReactNode }) {
  // Fail open during local dev if env is missing, so the marketing page still renders.
  if (!APP_ID) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[BLACKCROW] NEXT_PUBLIC_PRIVY_APP_ID is not set — auth disabled.");
    }
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={APP_ID}
      clientId={CLIENT_ID}
      config={{
        // Appearance, login methods and embedded-wallet behavior are managed
        // from the Privy dashboard (single source of truth). We only pass the
        // WalletConnect Cloud project id, which is an integration key.
        walletConnectCloudProjectId: WC_PROJECT_ID,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
