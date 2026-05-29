import type { Metadata } from "next";
import { Geist, Geist_Mono, Archivo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BLACKCROW — Predict Chaos. Move Markets. Stay Anonymous.",
  description:
    "The first social network for completely unqualified market manipulators. Anonymous prediction markets for degens.",
  openGraph: {
    title: "BLACKCROW",
    description: "Predict Chaos. Move Markets. Stay Anonymous.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
