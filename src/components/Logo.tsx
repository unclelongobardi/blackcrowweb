import Image from "next/image";

type LogoProps = {
  className?: string;
  /** When false, shows only the icon portion (for compact layouts). */
  showText?: boolean;
};

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/blackcrow-logo.png"
        alt="BLACKCROW"
        width={showText ? 240 : 48}
        height={48}
        priority
        className={`brightness-0 invert ${
          showText ? "h-9 w-auto sm:h-10" : "h-9 w-9 object-cover object-left sm:h-10 sm:w-10"
        }`}
      />
    </div>
  );
}
