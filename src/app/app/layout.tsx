import type { Metadata } from "next";
import AppShell from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "BLACKCROW — War Room",
  description: "Coordinate. Debate. Move markets.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
