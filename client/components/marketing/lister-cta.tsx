"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import { ProductImage } from "@/components/products/product-image";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductPage } from "@/hooks/queries/use-catalog";

export function ListerCta() {
  const productsQuery = useProductPage(1, 2);
  const featured = productsQuery.data?.products[0];

  return (
    <section className="container-page pb-16 md:pb-24">
      <div className="grid overflow-hidden rounded-panel border border-border bg-secondary/50 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="text-caption text-primary">For owners</p>
          <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
            Your unused things could
            <span className="font-display font-normal text-primary"> pay for themselves.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            List the things you already own. Add photos, set a price, and choose how renters reach
            you. You stay in control of what you share.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/listings/new">
                <Plus aria-hidden="true" />
                List a product
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/account/listings">See my listings</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-[280px] items-center justify-center p-8 lg:min-h-[380px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_65%)]"
          />
          <div className="relative w-full max-w-xs rotate-[-2deg] rounded-card border border-border bg-card p-3 shadow-lift">
            {productsQuery.isLoading ? (
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            ) : featured ? (
              <ProductImage
                images={featured.images}
                name={featured.productname}
                className="aspect-[4/3] w-full rounded-xl"
                sizes="(max-width: 1024px) 80vw, 320px"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary">
                <span className="font-display text-5xl text-primary/40">r</span>
              </div>
            )}
            <div className="flex items-end justify-between gap-3 px-1 pb-1 pt-4">
              <div className="min-w-0">
                <p className="text-caption text-muted-foreground">Listed on Rentify</p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {featured?.productname ?? "Your first rental"}
                </p>
              </div>
              {featured ? <Price amount={featured.price} suffix="base" /> : null}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-card">
            <Plus aria-hidden="true" className="size-3.5 text-primary" />
            Add up to 5 photos
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Not ready to list? Browse rentals
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
