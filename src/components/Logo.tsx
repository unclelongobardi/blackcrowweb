type LogoProps = {
  className?: string;
  showText?: boolean;
};

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M6 6 L58 6 L42 32 L58 58 L6 58 Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M16 40 C16 30 24 24 34 24 C30 27 29 30 29 33 L40 33 L33 39 C28 43 21 43 16 40 Z"
          fill="currentColor"
        />
        <circle cx="24" cy="30" r="1.8" fill="#050506" />
      </svg>
      {showText && (
        <span className="font-display text-[17px] font-extrabold tracking-[0.18em] text-foreground">
          BLACKCROW
        </span>
      )}
    </div>
  );
}
