"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/shared/error-state";
import type { Category } from "@/types/category";

export interface BrowseFilterPatch {
  category?: string | null;
  min?: string | null;
  max?: string | null;
}

export function FiltersPanel({
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
  selectedCategory,
  min,
  max,
  onChange,
  onClear,
}: {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: boolean;
  onRetryCategories: () => void;
  selectedCategory: string | null;
  min: string | null;
  max: string | null;
  onChange: (patch: BrowseFilterPatch) => void;
  onClear: () => void;
}) {
  const [minValue, setMinValue] = useState(min ?? "");
  const [maxValue, setMaxValue] = useState(max ?? "");

  const categoryButtons = [
    { id: null, name: "All categories" },
    ...categories.map((category) => ({ id: category._id, name: category.categoryName })),
  ];

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Category</h2>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear all
          </button>
        </div>

        {categoriesLoading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-9 animate-pulse rounded-input bg-muted" />
            ))}
          </div>
        ) : categoriesError ? (
          <ErrorState
            title="Categories unavailable"
            message="You can still search and filter by price."
            onRetry={onRetryCategories}
            className="mt-3 px-3 py-6"
          />
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {categoryButtons.map((category) => {
              const active = (category.id ?? null) === selectedCategory;
              return (
                <button
                  key={category.id ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ category: category.id })}
                  className={`rounded-pill border px-3 py-2 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold">Price range</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Filter by the product&apos;s base price.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="filter-min" className="text-xs text-muted-foreground">
              Min (₹)
            </Label>
            <Input
              id="filter-min"
              type="number"
              inputMode="numeric"
              min={0}
              value={minValue}
              onChange={(event) => setMinValue(event.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-max" className="text-xs text-muted-foreground">
              Max (₹)
            </Label>
            <Input
              id="filter-max"
              type="number"
              inputMode="numeric"
              min={0}
              value={maxValue}
              onChange={(event) => setMaxValue(event.target.value)}
              placeholder="Any"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => onChange({ min: minValue || null, max: maxValue || null })}
        >
          Apply price
        </Button>
      </div>

      <div className="rounded-card bg-secondary/60 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Search and filters apply to rentals already loaded. Use Load more to bring in more
          results.
        </p>
      </div>
    </div>
  );
}
