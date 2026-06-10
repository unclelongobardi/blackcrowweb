import type { Metadata } from "next";
import DocsHeader from "@/components/docs/DocsHeader";
import DocsContent from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: "BLACKCROW Docs — Platform guide",
  description:
    "Detailed documentation for BLACKCROW: bounties, War Room, markets, Feathers, cabals, and Solana payouts.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <DocsContent />
    </div>
  );
}
