import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service — BLACKCROW",
  description:
    "Terms of Service for BLACKCROW: wallet access, bounties, War Room, Feathers, cabals, and $CROW token.",
};

const UPDATED = "June 9, 2026";

export default function TermsPage() {
  return (
    <LegalLayout label="Legal" title="Terms of Service" updated={UPDATED}>
      <TermsContent />
    </LegalLayout>
  );
}
