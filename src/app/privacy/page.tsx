import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — VALORE",
  description:
    "Privacy Policy for VALORE: wallet data, profiles, Home feed, bounties, and $VLRE token interactions.",
};

const UPDATED = "June 9, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout label="Legal" title="Privacy Policy" updated={UPDATED}>
      <PrivacyContent />
    </LegalLayout>
  );
}
