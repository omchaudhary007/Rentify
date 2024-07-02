import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-panel border border-dashed border-border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        {Icon ? <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} /> : null}
      </div>
      <h2 className="text-xl font-semibold tracking-[-0.015em]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
