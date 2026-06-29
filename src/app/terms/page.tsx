import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — VALORE",
  description:
    "Terms of Service for VALORE: wallet access, bounties, Home feed, VLRE score, cabals, and $VLRE token.",
};

const UPDATED = "June 9, 2026";

export default function TermsPage() {
  return (
    <LegalLayout label="Legal" title="Terms of Service" updated={UPDATED}>
      <TermsContent />
    </LegalLayout>
  );
}
