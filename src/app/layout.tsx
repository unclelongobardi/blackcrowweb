import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://valore.network"),
  title: "VALORE — Manipulate Markets. Earn Rewards. Start Your Cabal.",
  description:
    "VALORE is a social layer for prediction-market operators — coordinate plays, fund bounties in SOL, and rank on the leaderboard. Anonymous, on Solana.",
  openGraph: {
    title: "VALORE",
    description: "Manipulate markets. Earn rewards. Start your cabal.",
    type: "website",
    images: [{ url: "/images/valore-logo.png", width: 512, height: 512, alt: "VALORE" }],
  },
  twitter: {
    card: "summary",
    images: ["/images/valore-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrains.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
