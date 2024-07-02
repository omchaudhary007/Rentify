import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  showTagline = false,
}: {
  href?: string;
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Rentify home"
      className={cn("group inline-flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
    >
      <span className="relative flex size-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
        <span className="font-display text-xl leading-none">r</span>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[19px] font-semibold tracking-[-0.035em] text-foreground">
          Rentify
        </span>
        {showTagline ? (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Rent better. Own less.
          </span>
        ) : null}
      </span>
    </Link>
  );
}
