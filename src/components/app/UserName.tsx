import Link from "next/link";

export default function UserName({
  codename,
  displayName,
  verified,
  className = "",
  link = true,
}: {
  codename: string;
  displayName?: string | null;
  verified?: boolean;
  className?: string;
  link?: boolean;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="font-semibold">{displayName || codename}</span>
      {verified && (
        <svg className="h-3.5 w-3.5 shrink-0 text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
          <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      )}
      <span className="font-normal text-faint">@{codename}</span>
    </span>
  );

  if (!link) return inner;
  return (
    <Link href={`/app/u/${codename}`} className="transition-colors hover:text-foreground">
      {inner}
    </Link>
  );
}
