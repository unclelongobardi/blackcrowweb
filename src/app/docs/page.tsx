import type { Metadata } from "next";
import DocsHeader from "@/components/docs/DocsHeader";
import DocsContent from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: "VEXORA Docs — Platform guide",
  description:
    "Detailed documentation for VEXORA: bounties, Home feed, markets, VEX, cabals, and Solana payouts.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <DocsContent />
    </div>
  );
}
