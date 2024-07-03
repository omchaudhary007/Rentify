"use client";

import { ArrowRight, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductImage } from "@/components/products/product-image";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductPage } from "@/hooks/queries/use-catalog";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const productsQuery = useProductPage(1, 3);
  const heroProduct = productsQuery.data?.products[0];

  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_70%_10%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="container-page grid items-center gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
            <Sparkles aria-hidden="true" className="size-3.5 text-primary" strokeWidth={1.75} />
            Rentals for real life
          </span>

          <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]">
            Rent the good stuff.
            <br />
            <span className="font-display font-normal text-primary">Skip the ownership.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Furniture, electronics, and home essentials from people nearby — on plans that fit your
            life.
          </p>

          <form
            className="mt-7 max-w-xl rounded-panel border border-border bg-card p-2 shadow-card"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = query.trim();
              router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
            }}
            role="search"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="hero-search" className="sr-only">
                What do you need?
              </label>
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="hero-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="What do you need?"
                  className="h-11 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" variant="accent" className="h-11 shrink-0">
                Search rentals
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </form>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
              Secure payments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck aria-hidden="true" className="size-3.5 text-primary" />
              Doorstep delivery
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
              Flexible plans
            </span>
          </p>
        </div>

        <div className="relative lg:col-span-5">
          <div className="pointer-events-none absolute -left-4 top-10 z-10 hidden rounded-card border border-border bg-card/95 px-3.5 py-2.5 shadow-card backdrop-blur lg:block">
            <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Plans from</p>
            <p className="text-sm font-semibold">1 to 24 months</p>
          </div>

          <div className="overflow-hidden rounded-panel border border-border bg-card shadow-lift lg:rotate-[1.5deg]">
            {productsQuery.isLoading ? (
              <Skeleton className="aspect-[5/6] w-full rounded-none" />
            ) : heroProduct ? (
              <>
                <ProductImage
                  images={heroProduct.images}
                  name={heroProduct.productname}
                  className="aspect-[5/6] w-full"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="space-y-1 border-t border-border p-5">
                  <p className="text-caption text-muted-foreground">Featured rental</p>
                  <div className="flex items-end justify-between gap-3">
                    <p className="line-clamp-1 text-lg font-semibold tracking-[-0.015em]">
                      {heroProduct.productname}
                    </p>
                    <Price amount={heroProduct.price} suffix="base" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex aspect-[5/6] flex-col items-center justify-center bg-secondary p-8 text-center">
                <span className="font-display text-6xl text-primary/40">r</span>
                <p className="mt-4 text-sm font-medium">Find something worth renting</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New rentals appear as owners list them.
                </p>
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute -bottom-4 right-3 z-10 rounded-card border border-border bg-card/95 px-3.5 py-2.5 shadow-card backdrop-blur">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium">
              <Truck aria-hidden="true" className="size-3.5 text-primary" />
              Delivery + return pickup included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
