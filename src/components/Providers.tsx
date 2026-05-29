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
        appearance: {
          theme: "dark",
          accentColor: "#2BD576",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-only",
          landingHeader: "Enter the network",
          loginMessage: "Predict chaos. Move markets. Stay anonymous.",
        },
        loginMethods: ["email", "wallet", "google", "twitter", "discord"],
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        walletConnectCloudProjectId: WC_PROJECT_ID,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
