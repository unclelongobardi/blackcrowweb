import Image from "next/image";
import { BRAND_NAME, VEXORA_LOGO_SRC } from "@/lib/links";

type LogoProps = {
  className?: string;
  /** When false, shows only the icon mark (no wordmark). */
  showText?: boolean;
  /** Show "NETWORK" subtitle under wordmark. */
  showNetwork?: boolean;
};

export function VexoraMark({
  className = "h-9 w-9 sm:h-10 sm:w-10",
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      src={VEXORA_LOGO_SRC}
      alt={alt}
      width={40}
      height={40}
      className={`shrink-0 object-contain ${className}`}
      priority
    />
  );
}

export default function Logo({ className = "", showText = true, showNetwork = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <VexoraMark alt={showText ? "" : BRAND_NAME} />
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

export { VEXORA_LOGO_SRC };
