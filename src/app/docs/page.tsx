import type { Metadata } from "next";
import DocsHeader from "@/components/docs/DocsHeader";
import DocsContent from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: "VALORE Docs — Platform guide",
  description:
    "Detailed documentation for VALORE: bounties, Home feed, markets, VALORE score, cabals, and Solana payouts.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <DocsContent />
    </div>
  );
}
