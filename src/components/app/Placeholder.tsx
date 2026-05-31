import type { ReactNode } from "react";

export default function Placeholder({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[636px] border-x border-line min-h-screen">
      <div className="sticky top-16 z-30 border-b border-line bg-background/70 px-5 py-4 backdrop-blur-xl">
        <h1 className="font-display text-lg font-extrabold tracking-tight">{title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface-2 text-faint">
          {icon}
        </div>
        <h2 className="mt-5 text-[15px] font-semibold text-foreground">{title} coming online</h2>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
