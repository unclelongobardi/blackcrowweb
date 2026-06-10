"use client";

import Image from "next/image";
import Link from "next/link";

const SRC = "/images/world-cup-special-bounties.png";

export default function WorldCupBountiesButton({
  className = "",
  href = "/app/bounties#world-cup-bounties",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`ui-press group block transition duration-200 hover:scale-[1.015] active:scale-[0.99] ${className}`}
      aria-label="World Cup Special Bounties — 10 FIFA 2026 jobs, 10 to 100 SOL"
    >
      <Image
        src={SRC}
        alt="World Cup Special Bounties"
        width={1024}
        height={320}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 720px"
        className="h-auto w-full drop-shadow-[0_8px_28px_rgba(212,175,55,0.25)] transition duration-200 group-hover:drop-shadow-[0_10px_36px_rgba(212,175,55,0.4)]"
        priority
      />
    </Link>
  );
}
