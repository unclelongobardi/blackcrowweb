import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function IconSkull(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13a8 8 0 1 1 16 0c0 2-1 3-2 4v2a2 2 0 0 1-2 2h-1v-2H11v2h-1a2 2 0 0 1-2-2v-2c-1-1-2-2-2-4Z" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <path d="M12 16v2" />
    </svg>
  );
}

export function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h16" />
      <rect x="5" y="11" width="3" height="6" rx="1" />
      <rect x="10.5" y="7" width="3" height="10" rx="1" />
      <rect x="16" y="4" width="3" height="13" rx="1" />
    </svg>
  );
}

export function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M17 14.5a5.5 5.5 0 0 1 3.5 4.5" />
    </svg>
  );
}

export function IconBolt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function IconTrophy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3" />
      <path d="M17 6h3v1a3 3 0 0 1-3 3" />
      <path d="M9.5 13.5 9 18h6l-.5-4.5" />
      <path d="M7 21h10" />
    </svg>
  );
}

export function IconArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconFlame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 7 12 3Z" />
      <path d="M12 22c-3.5 0-6-2.5-6-6 0-2.5 1.5-4 2-5.5.5 1.5 2 2.5 2.5 4 .5-1 1-1.5 1-2.5 2 1.5 4 3 4 5.5 0 3.5-2.5 6-6 6Z" />
    </svg>
  );
}

export function IconComment(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

export function IconRepeat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9V8a3 3 0 0 1 3-3h10l-2-2" />
      <path d="M20 15v1a3 3 0 0 1-3 3H7l2 2" />
    </svg>
  );
}

export function IconHeart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.3-9.2-8.5C1.3 8.4 3 5 6.2 5 8 5 9.3 6 12 8.5 14.7 6 16 5 17.8 5 21 5 22.7 8.4 21.2 11.5 19 15.7 12 20 12 20Z" />
    </svg>
  );
}

export function IconDots(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}

export function IconFeed(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h10" />
    </svg>
  );
}

export function IconGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconWallet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1" />
    </svg>
  );
}

export function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 9a5 5 0 0 1 10 0c0 4.5 2 5.5 2 5.5H5S7 13.5 7 9Z" />
      <path d="M10.5 18.5a1.8 1.8 0 0 0 3 0" />
    </svg>
  );
}

export function IconUser(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5H9.4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h5.2l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" />
    </svg>
  );
}

export function IconChart2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V5" />
      <path d="m4 15 4-4 4 3 8-8" />
    </svg>
  );
}

export function IconX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4l16 16M20 4 4 20" />
    </svg>
  );
}

export function IconTelegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M21 5 3 11l5 2 2 6 3-4 5 4 3-14Z" />
      <path d="m8 13 8-5" />
    </svg>
  );
}

export function IconDiscord(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 7a14 14 0 0 1 10 0l2 11a13 13 0 0 1-4 2l-1-2a10 10 0 0 1-4 0l-1 2a13 13 0 0 1-4-2L7 7Z" />
      <circle cx="9.5" cy="13" r="1" />
      <circle cx="14.5" cy="13" r="1" />
    </svg>
  );
}

export function IconGlobe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </svg>
  );
}

export function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 11.5 12 5l7 6.5" />
      <path d="M7.5 10.5V19h9v-8.5" />
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconMail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="m3 8 9 6 9-6" />
      <path d="M3 19l6.5-5M21 19l-6.5-5" />
    </svg>
  );
}

export function IconBookmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h12v16l-6-4-6 4Z" />
    </svg>
  );
}

export function IconImage(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </svg>
  );
}

export function IconPoll(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </svg>
  );
}

export function IconThread(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h7" />
    </svg>
  );
}

export function IconFilter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5h16l-6 7v6l-4 2v-8Z" />
    </svg>
  );
}

export function IconViews(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V6" />
      <path d="M9 20V12" />
      <path d="M14 20V9" />
      <path d="M19 20V4" />
    </svg>
  );
}

export function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconShare(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}

/** Solana — official brand mark (PNG from brand asset) */
export function IconSolana({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/solana-logo.png"
      alt=""
      aria-hidden
      className={className ?? "h-4 w-4 shrink-0"}
    />
  );
}

/** X / Twitter social */
export function IconTwitterX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Dexscreener — official favicon / brand mark */
export function IconDexscreener({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/dexscreener-logo.ico"
      alt=""
      aria-hidden
      className={className ?? "h-4 w-4 shrink-0"}
    />
  );
}

/** Reputation / GLORIA score */
export function IconGloria(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path d="M6 7 L12 17 L18 7 H15.5 L12 13 L8.5 7 H6 Z" fill="currentColor" />
    </svg>
  );
}


/** Cabal — linked operatives in angular frame */
export function IconCabal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M5 6.5 12 3l7 3.5v9L12 20l-7-3.5v-9Z" />
      <circle cx="12" cy="8.5" r="1.6" />
      <circle cx="8.2" cy="14.5" r="1.6" />
      <circle cx="15.8" cy="14.5" r="1.6" />
      <path d="M12 10.2v1.8M10.4 13.2l1.2-1M13.6 13.2l-1.2-1" />
    </svg>
  );
}

/** Leaderboard rank */
export function IconRank(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 20V10l6-4 6 4v10" />
      <path d="M9 20v-5h6v5" />
      <path d="M12 6v3" />
    </svg>
  );
}

/** Anonymous operator — GLORIA angular frame */
export function IconOperator(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M4 5.5 20 5.5 15.5 12 20 18.5 4 18.5 8.5 12 4 5.5Z" />
      <circle cx="12" cy="11.5" r="2.5" />
      <path d="M9.5 16.5h5" />
    </svg>
  );
}

/** Home — public timeline feed */
export function IconWarRoom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M5 7h12a1 1 0 0 1 1 1v2.5H4V8a1 1 0 0 1 1-1Z" />
      <path d="M4 10.5h16v2.5a1 1 0 0 1-1 1H9l-2.5 3H9v-3" />
      <path d="M7.5 15.5h9M7.5 18h6" />
      <circle cx="17.5" cy="8.5" r="1.35" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Target / bounty hub */
export function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}
