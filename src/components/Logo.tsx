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
        width={showText ? 200 : 40}
        height={40}
        priority
        className={`brightness-0 invert ${
          showText ? "h-7 w-auto sm:h-8" : "h-8 w-8 object-cover object-left"
        }`}
      />
    </div>
  );
}
