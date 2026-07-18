import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — GLORIA",
  description:
    "Privacy Policy for GLORIA: wallet data, profiles, Home feed, bounties, and $GLORIA token interactions.",
};

const UPDATED = "July 18, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout label="Legal" title="Privacy Policy" updated={UPDATED}>
      <PrivacyContent />
    </LegalLayout>
  );
}
