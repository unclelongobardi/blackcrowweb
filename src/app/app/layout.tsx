import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "VEXORA NETWORK — Home",
  description: "Coordinate. Debate. Move markets.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-foreground" />
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
