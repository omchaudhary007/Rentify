"use client";

import { ArrowRight, PackageOpen } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useProductPage,
  useSubcategories,
} from "@/hooks/queries/use-catalog";

export function FeaturedProducts() {
  const productsQuery = useProductPage(1, 8);
  const categoriesQuery = useCategories();
  const subcategoriesQuery = useSubcategories();

  const products = productsQuery.data?.products ?? [];
  const categories = categoriesQuery.data ?? [];
  const subcategories = subcategoriesQuery.data ?? [];

  const categoryNameFor = (subcategoryId: string) => {
    const subcategory = subcategories.find((item) => item._id === subcategoryId);
    if (!subcategory) return "Rental";
    const category = categories.find((item) => item._id === subcategory.category);
    return category?.categoryName ?? subcategory.subcategoryName;
  };

  return (
    <section className="container-page section-space">
      <SectionHeading
        eyebrow="Fresh finds"
        title="Featured rentals"
        description="Real products listed by people nearby, ready for your next place or project."
        action={
          <Button asChild variant="outline">
            <Link href="/products">
              Browse all rentals
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <div className="mt-8">
        {productsQuery.isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : productsQuery.isError ? (
          <ErrorState
            title="Featured rentals could not load"
            message="The rest of the page still works. Try loading the rentals again."
            onRetry={() => void productsQuery.refetch()}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No rentals listed yet"
            description="New products will show up here as owners list them. You can browse everything in the meantime."
            action={
              <Button asChild>
                <Link href="/products">Browse rentals</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                categoryName={categoryNameFor(product.subcategory)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
