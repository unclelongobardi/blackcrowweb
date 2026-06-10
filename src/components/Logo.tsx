import Image from "next/image";

type LogoProps = {
  className?: string;
  /** When false, shows only the icon mark (no wordmark). */
  showText?: boolean;
};

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/blackcrow-mark-white.png"
        alt="BLACKCROW"
        width={40}
        height={40}
        priority
        className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
      />
      {showText && (
        <span className="font-display text-[17px] font-extrabold tracking-[0.18em] text-foreground">
          BLACKCROW
        </span>
      )}
    </div>
  );
}
