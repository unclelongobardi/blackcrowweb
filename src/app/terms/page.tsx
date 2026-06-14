import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — VEXORA",
  description:
    "Terms of Service for VEXORA: wallet access, bounties, Home feed, VEX, cabals, and $VEXORA token.",
};

const UPDATED = "June 9, 2026";

export default function TermsPage() {
  return (
    <LegalLayout label="Legal" title="Terms of Service" updated={UPDATED}>
      <TermsContent />
    </LegalLayout>
  );
}
