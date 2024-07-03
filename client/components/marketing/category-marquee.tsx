"use client";

import Image from "next/image";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/queries/use-catalog";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category._id}`}
      className="group flex w-36 shrink-0 flex-col items-center gap-2 rounded-card p-2 text-center transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-40"
    >
      <div className="relative size-20 overflow-hidden rounded-full border border-border bg-secondary sm:size-24">
        {category.categoryImg?.url ? (
          <Image
            src={category.categoryImg.url}
            alt={category.categoryName}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-lg font-semibold text-primary/50">
              {initials(category.categoryName)}
            </span>
          </div>
        )}
      </div>
      <span className="w-full truncate text-sm font-medium capitalize">
        {category.categoryName}
      </span>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex w-36 shrink-0 flex-col items-center gap-2 sm:w-40">
          <Skeleton className="size-20 rounded-full sm:size-24" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function CategoryMarquee() {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];
  const marqueeItems = categories.slice(0, 10);

  return (
    <section id="categories" className="border-b border-border/70 bg-background">
      <div className="container-page py-12 md:py-14">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption text-primary">Browse by category</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
              Start with what you need
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all rentals
          </Link>
        </div>

        <div className="mt-7">
          {categoriesQuery.isLoading ? (
            <SkeletonRow />
          ) : categoriesQuery.isError ? (
            <ErrorState
              title="Categories are unavailable"
              message="You can still browse all rentals while we try again."
              onRetry={() => void categoriesQuery.refetch()}
              className="py-8"
            />
          ) : marqueeItems.length === 0 ? (
            <p className="rounded-card border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Categories will appear here as owners add listings.
            </p>
          ) : (
            <>
              <div className="no-scrollbar flex gap-4 overflow-x-auto sm:hidden">
                {marqueeItems.map((category) => (
                  <CategoryTile key={category._id} category={category} />
                ))}
              </div>
              <div className="group hidden overflow-hidden sm:block">
                <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                  {marqueeItems.map((category) => (
                    <CategoryTile key={category._id} category={category} />
                  ))}
                  <div aria-hidden="true" className={cn("flex gap-4")}>
                    {marqueeItems.map((category) => (
                      <CategoryTile key={`duplicate-${category._id}`} category={category} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
