import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  amount,
  suffix,
  className,
  size = "default",
}: {
  amount: number;
  suffix?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
}) {
  const sizes = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-xl",
    xl: "text-3xl",
  } as const;

  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular", className)}>
      <span className={cn("font-semibold tracking-[-0.02em]", sizes[size])}>{formatINR(amount)}</span>
      {suffix ? <span className="text-xs font-normal text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}
