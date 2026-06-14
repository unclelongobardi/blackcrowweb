import type { SVGProps } from "react";
import { BRAND_NAME } from "@/lib/links";

type LogoProps = {
  className?: string;
  /** When false, shows only the icon mark (no wordmark). */
  showText?: boolean;
  /** Show "NETWORK" subtitle under wordmark. */
  showNetwork?: boolean;
};

export function VexoraMark({ className = "h-9 w-9 sm:h-10 sm:w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <rect width="40" height="40" rx="10" fill="#1652F0" />
      <path
        d="M11 12 L20 28 L29 12 H25.2 L20 22.5 L14.8 12 H11 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default function Logo({ className = "", showText = true, showNetwork = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <VexoraMark />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-extrabold tracking-[0.14em] text-foreground">
            {BRAND_NAME}
          </span>
          {showNetwork && (
            <span className="mt-0.5 text-[9px] font-semibold tracking-[0.22em] text-muted">NETWORK</span>
          )}
        </div>
      )}
    </div>
  );
}

export function IconVex(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6 7 L12 17 L18 7 H15.5 L12 13 L8.5 7 H6 Z"
        fill="currentColor"
      />
    </svg>
  );
}
