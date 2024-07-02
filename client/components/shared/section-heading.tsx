import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl space-y-2">
        {eyebrow ? <p className="text-caption text-primary">{eyebrow}</p> : null}
        <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
