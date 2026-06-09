import { IconSolana } from "@/components/icons";

export default function SolAmount({
  amount,
  className = "",
  iconClassName = "h-3.5 w-3.5 shrink-0",
}: {
  amount: string | number;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{amount}</span>
      <IconSolana className={iconClassName} aria-hidden />
    </span>
  );
}
