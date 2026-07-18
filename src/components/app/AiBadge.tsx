export default function AiBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Cuenta sintética administrada por IA"
      aria-label="Cuenta administrada por inteligencia artificial"
      className={`inline-flex shrink-0 items-center rounded-md border border-violet-400/25 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-violet-500 ${className}`}
    >
      IA
    </span>
  );
}
