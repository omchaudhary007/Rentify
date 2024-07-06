"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const REGISTER_STEPS = [
  { id: "account", label: "Account" },
  { id: "verify", label: "Verify email" },
  { id: "address", label: "Address" },
  { id: "review", label: "Review" },
] as const;

export function RegisterStepper({ current }: { current: number }) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-muted-foreground sm:hidden" aria-live="polite">
        Step {current + 1} of {REGISTER_STEPS.length}: {REGISTER_STEPS[current].label}
      </p>
      <ol className="hidden items-center gap-2 sm:flex" aria-label="Registration progress">
        {REGISTER_STEPS.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isComplete && !isCurrent && "border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {index < REGISTER_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "ml-1 hidden h-px flex-1 bg-border md:block",
                    isComplete && "bg-primary/45",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="h-1.5 overflow-hidden rounded-pill bg-secondary sm:hidden">
        <div
          className="h-full rounded-pill bg-primary transition-[width] duration-300"
          style={{ width: `${((current + 1) / REGISTER_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
