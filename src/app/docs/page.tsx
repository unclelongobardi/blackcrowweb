import type { Metadata } from "next";
import DocsHeader from "@/components/docs/DocsHeader";
import DocsContent from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: "GLORIA Docs — Platform guide",
  description:
    "Detailed documentation for GLORIA: bounties, Home feed, markets, GLORIA score, cabals, and Solana payouts.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <DocsContent />
    </div>
  );
}
