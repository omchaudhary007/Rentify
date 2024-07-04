"use client";

import {
  Loader2,
  PackageOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { FiltersPanel, type BrowseFilterPatch } from "@/components/products/filters-panel";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCategories, useSubcategories } from "@/hooks/queries/use-catalog";
import { useCategorySubcategories } from "@/hooks/queries/use-category-subcategories";
import { useInfiniteProducts } from "@/hooks/queries/use-products-infinite";
import type { Product } from "@/types/product";

const SORT_OPTIONS = [
  { value: "newest", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function parsePrice(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function BrowseClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const rawSort = searchParams.get("sort");
  const sort: SortValue = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as SortValue)
    : "newest";

  const productsQuery = useInfiniteProducts(12);
  const categoriesQuery = useCategories();
  const subcategoriesQuery = useSubcategories();
  const categorySubcategoriesQuery = useCategorySubcategories(category);

  const categories = categoriesQuery.data ?? [];
  const subcategories = subcategoriesQuery.data ?? [];

  const allLoaded = useMemo(() => {
    const pages = productsQuery.data?.pages ?? [];
    const seen = new Set<string>();
    const result: Product[] = [];
    pages.forEach((page) => {
      page.products.forEach((product) => {
        if (!seen.has(product._id)) {
          seen.add(product._id);
          result.push(product);
        }
      });
    });
    return result;
  }, [productsQuery.data]);

  const selectedCategorySubIds = useMemo(() => {
    if (!category) return null;
    if (!categorySubcategoriesQuery.data) return new Set<string>();
    return new Set(categorySubcategoriesQuery.data.map((item) => item._id));
  }, [category, categorySubcategoriesQuery.data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const minPrice = parsePrice(min);
    const maxPrice = parsePrice(max);

    const result = allLoaded.filter((product) => {
      if (selectedCategorySubIds && !selectedCategorySubIds.has(product.subcategory)) return false;
      if (query) {
        const haystack = `${product.productname} ${product.brand ?? ""} ${product.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (minPrice !== null && product.price < minPrice) return false;
      if (maxPrice !== null && product.price > maxPrice) return false;
      return true;
    });

    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [allLoaded, max, min, q, selectedCategorySubIds, sort]);

  const categoryNameFor = (subcategoryId: string) => {
    const subcategory = subcategories.find((item) => item._id === subcategoryId);
    if (!subcategory) return "Rental";
    const parent = categories.find((item) => item._id === subcategory.category);
    return parent?.categoryName ?? subcategory.subcategoryName;
  };

  const selectedCategoryName = categories.find((item) => item._id === category)?.categoryName;

  const applyParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const activeFilterCount =
    (q ? 1 : 0) + (min || max ? 1 : 0) + (category ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  const handleFilterChange = (patch: BrowseFilterPatch) => {
    applyParams({
      category: patch.category === undefined ? category : patch.category,
      min: patch.min === undefined ? min : patch.min,
      max: patch.max === undefined ? max : patch.max,
    });
  };

  const mobileFilterChange = (patch: BrowseFilterPatch) => {
    handleFilterChange(patch);
    setFilterSheetOpen(false);
  };

  const filtersPanel = (
    <FiltersPanel
      key={`${category ?? "all"}-${min ?? ""}-${max ?? ""}`}
      categories={categories}
      categoriesLoading={categoriesQuery.isLoading}
      categoriesError={categoriesQuery.isError}
      onRetryCategories={() => void categoriesQuery.refetch()}
      selectedCategory={category}
      min={min}
      max={max}
      onChange={handleFilterChange}
      onClear={clearAll}
    />
  );

  return (
    <div className="container-page py-8 md:py-12">
      <PageHeader
        eyebrow="Browse"
        title="Find your next rental"
        description="Furniture, electronics, and home essentials from people nearby. Search and filter the rentals loaded so far."
        actions={
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={() => setFilterSheetOpen(true)}
          >
            <SlidersHorizontal aria-hidden="true" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        }
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-card border border-border bg-card p-5 shadow-card">
            {filtersPanel}
          </div>
        </aside>

        <div className="min-w-0">
          <form
            role="search"
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const nextQuery = String(formData.get("q") ?? "").trim();
              applyParams({ q: nextQuery || null });
            }}
          >
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor="browse-search" className="sr-only">
                Search rentals
              </label>
              <Input
                key={`search-${q}`}
                id="browse-search"
                name="q"
                defaultValue={q}
                placeholder="Search by name, brand, or description"
                className="pl-10"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
                loaded rentals
              </p>
              {q ? (
                <FilterChip
                  label={`Search: ${q}`}
                  onRemove={() => applyParams({ q: null })}
                />
              ) : null}
              {category ? (
                <FilterChip
                  label={selectedCategoryName ?? "Category"}
                  onRemove={() => applyParams({ category: null })}
                />
              ) : null}
              {min || max ? (
                <FilterChip
                  label={`₹${min ?? 0} – ₹${max ?? "Any"}`}
                  onRemove={() => applyParams({ min: null, max: null })}
                />
              ) : null}
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="browse-sort" className="text-xs text-muted-foreground">
                Sort
              </label>
              <Select
                value={sort}
                onValueChange={(value) => applyParams({ sort: value === "newest" ? null : value })}
              >
                <SelectTrigger id="browse-sort" className="h-10 w-[180px]">
                  <SelectValue placeholder="Sort rentals" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            {productsQuery.isLoading || (category && categorySubcategoriesQuery.isLoading) ? (
              <ProductGridSkeleton count={8} />
            ) : productsQuery.isError ? (
              <ErrorState
                title="Rentals could not load"
                message="Check your connection and try loading the rentals again."
                onRetry={() => void productsQuery.refetch()}
              />
            ) : allLoaded.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title="No rentals listed yet"
                description="When owners add products, they will appear here. Check back soon."
                action={
                  <Button asChild variant="outline">
                    <Link href="/">Back to home</Link>
                  </Button>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No rentals match these filters"
                description="Try a different search term or price range. Filters only apply to rentals already loaded."
                action={
                  <Button type="button" variant="outline" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      categoryName={categoryNameFor(product.subcategory)}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center gap-2">
                  {productsQuery.hasNextPage ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={productsQuery.isFetchingNextPage}
                      onClick={() => void productsQuery.fetchNextPage()}
                    >
                      {productsQuery.isFetchingNextPage ? (
                        <>
                          <Loader2 aria-hidden="true" className="animate-spin" />
                          Loading more…
                        </>
                      ) : (
                        "Load more rentals"
                      )}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      You have reached the end of the loaded rentals.
                    </p>
                  )}
                  <p className="max-w-md text-center text-xs leading-5 text-muted-foreground">
                    The marketplace does not provide a total count or server-side filters yet, so
                    filters apply to the rentals loaded on this page.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the rentals loaded so far.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 px-4 pb-8">
            <FiltersPanel
              key={`mobile-${category ?? "all"}-${min ?? ""}-${max ?? ""}`}
              categories={categories}
              categoriesLoading={categoriesQuery.isLoading}
              categoriesError={categoriesQuery.isError}
              onRetryCategories={() => void categoriesQuery.refetch()}
              selectedCategory={category}
              min={min}
              max={max}
              onChange={mobileFilterChange}
              onClear={() => {
                clearAll();
                setFilterSheetOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill border border-border bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
      <span className="max-w-40 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}
