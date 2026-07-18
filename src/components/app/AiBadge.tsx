export default function AiBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="AI-managed account"
      aria-label="AI-managed account"
      className={`inline-flex shrink-0 items-center rounded-md border border-violet-400/25 bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-violet-500 ${className}`}
    >
      AI
    </span>
  );
}
