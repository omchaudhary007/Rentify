"use client";

import { Check } from "lucide-react";

import { formatINR } from "@/lib/format";
import type { RentalPlanKey, RentalPlanOption } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PlanSelector({
  plans,
  selected,
  onSelect,
  disabled = false,
  ariaLabel = "Rental plan",
}: {
  plans: RentalPlanOption[];
  selected: RentalPlanKey;
  onSelect: (key: RentalPlanKey) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="grid grid-cols-2 gap-2">
      {plans.map((plan) => {
        const isSelected = plan.key === selected;
        const isDisabled = disabled || plan.percent === null;
        return (
          <button
            key={plan.key}
            type="button"
            aria-pressed={isSelected}
            disabled={isDisabled}
            onClick={() => onSelect(plan.key)}
            className={cn(
              "relative flex flex-col items-start rounded-input border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{plan.label}</span>
              {isSelected ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check aria-hidden="true" className="size-2.5" strokeWidth={2.5} />
                </span>
              ) : null}
            </span>
            {plan.percent === null ? (
              <span className="mt-1 text-sm font-semibold">Unavailable</span>
            ) : (
              <>
                <span className="mt-1 text-sm font-semibold tabular">{formatINR(plan.total)}</span>
                <span className="mt-0.5 text-[11px] text-muted-foreground tabular">
                  {formatINR(plan.effectiveMonthly)}/mo
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
