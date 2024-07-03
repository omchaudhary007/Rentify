import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

import { ProductImage } from "./product-image";

export function ProductCard({
  product,
  categoryName,
  className,
}: {
  product: Product;
  categoryName?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/products/${product._id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <ProductImage
          images={product.images}
          name={product.productname}
          className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.outofStock ? (
          <span className="absolute left-3 top-3 rounded-pill bg-card/90 px-2.5 py-1 text-xs font-medium text-destructive backdrop-blur">
            Unavailable
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-caption text-muted-foreground">{categoryName ?? "Rental"}</p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">
          {product.productname}
        </h3>
        {product.brand ? (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <Price amount={product.price} size="lg" />
            <p className="mt-0.5 text-xs text-muted-foreground">base price · 1–24 month plans</p>
          </div>
          <span
            aria-hidden="true"
            className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </Link>
  );
}
