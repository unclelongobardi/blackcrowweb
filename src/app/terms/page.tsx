import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — GLORIA",
  description:
    "Terms of Service for GLORIA: wallet access, bounties, Home feed, GLORIA score, cabals, and $GLORIA token.",
};

const UPDATED = "July 1, 2026";

export default function TermsPage() {
  return (
    <LegalLayout label="Legal" title="Terms of Service" updated={UPDATED}>
      <TermsContent />
    </LegalLayout>
  );
}
