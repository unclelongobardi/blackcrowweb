import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — VALORE",
  description:
    "Terms of Service for VALORE: wallet access, bounties, Home feed, VALORE score, cabals, and $VALORE token.",
};

const UPDATED = "July 1, 2026";

export default function TermsPage() {
  return (
    <LegalLayout label="Legal" title="Terms of Service" updated={UPDATED}>
      <TermsContent />
    </LegalLayout>
  );
}
