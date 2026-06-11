import Link from "next/link";
import Logo from "@/components/Logo";
import TokenCaChip from "@/components/TokenCaChip";
import { IconArrow } from "@/components/icons";

export default function LegalLayout({
  label,
  title,
  updated,
  children,
}: {
  label: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="shrink-0 text-foreground">
              <Logo showText={false} />
            </Link>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="hidden text-[12px] font-bold tracking-[0.14em] text-muted sm:block">{label}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TokenCaChip className="hidden sm:flex" />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-muted transition-colors hover:text-foreground"
            >
              <IconArrow className="h-3.5 w-3.5 rotate-180" />
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 pb-20">
        <header className="mb-10 border-b border-line pb-8">
          <p className="section-label">{label}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-[13px] text-faint">Last updated: {updated}</p>
          <nav className="mt-4 flex flex-wrap gap-4 text-[12px] font-semibold tracking-wide text-muted">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
          </nav>
        </header>
        <article className="legal-prose">{children}</article>
      </main>
    </div>
  );
}
