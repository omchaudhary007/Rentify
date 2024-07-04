"use client";

import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Lock,
  PackageX,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ProductGallery } from "@/components/products/product-gallery";
import { PlanSelector } from "@/components/products/plan-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Price } from "@/components/shared/price";
import { DetailSkeleton } from "@/components/shared/skeletons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAddToCart } from "@/hooks/mutations/use-cart-mutations";
import { useCart } from "@/hooks/queries/use-cart";
import { useProduct, useSubcategories } from "@/hooks/queries/use-catalog";
import { getApiStatus } from "@/lib/api/errors";
import { formatINR } from "@/lib/format";
import {
  buildRentalPlans,
  getPlan,
  type RentalPlanKey,
} from "@/lib/pricing";
import { useAuth } from "@/providers/auth-provider";

export function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const productQuery = useProduct(id);
  const subcategoriesQuery = useSubcategories();
  const addToCart = useAddToCart();
  const cartQuery = useCart(user?.role === "user");
  const [planKey, setPlanKey] = useState<RentalPlanKey>("monthPercent");

  if (productQuery.isLoading) {
    return (
      <div className="container-page py-8 md:py-12">
        <DetailSkeleton />
      </div>
    );
  }

  if (productQuery.isError) {
    const status = getApiStatus(productQuery.error);
    if (status === 400) {
      return (
        <div className="container-page py-12">
          <EmptyState
            icon={PackageX}
            title="This rental is no longer available"
            description="The product may have been removed. Browse other rentals to find something similar."
            action={
              <Button asChild>
                <Link href="/products">Browse rentals</Link>
              </Button>
            }
          />
        </div>
      );
    }
    return (
      <div className="container-page py-12">
        <ErrorState
          title="This rental could not load"
          message="Check your connection and try again."
          onRetry={() => void productQuery.refetch()}
        />
      </div>
    );
  }

  const product = productQuery.data;
  if (!product) {
    return null;
  }

  const subcategory = subcategoriesQuery.data?.find((item) => item._id === product.subcategory);
  const plan = getPlan(planKey);
  const plans = buildRentalPlans(product.price, subcategory, {
    dimensions: product,
    includeDelivery: true,
  });
  const selectedPlan = plans.find((item) => item.key === planKey) ?? plans[0];
  const hasPricing = selectedPlan.percent !== null;
  const deliveryCharge = selectedPlan.total - selectedPlan.rent > 0 ? (selectedPlan.total - selectedPlan.rent) / 2 : 0;
  const isOutOfStock = product.outofStock;
  const inCart = cartQuery.data?.cart?.includes(product._id) ?? false;

  const requireRenter = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/products/${product._id}`);
      return false;
    }
    if (user?.role !== "user") {
      toast.error("Only renter accounts can rent.");
      return false;
    }
    return true;
  };

  const handleRentNow = () => {
    if (isOutOfStock || !hasPricing) return;
    if (!requireRenter()) return;
    router.push(`/checkout/${product._id}?plan=${planKey}`);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!requireRenter()) return;
    addToCart.mutate(product._id);
  };

  const categoryLabel = subcategory?.subcategoryName ?? "Rental";

  return (
    <div className="container-page pb-28 pt-6 md:py-10 lg:pb-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Browse</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="hidden sm:block">
            <span className="capitalize text-muted-foreground">{categoryLabel}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-48 truncate">{product.productname}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-8 lg:col-span-7">
          <ProductGallery images={product.images} name={product.productname} />

          <section aria-labelledby="description-heading">
            <h2 id="description-heading" className="text-xl font-semibold tracking-[-0.02em]">
              About this rental
            </h2>
            <p className="mt-3 max-w-[68ch] whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          </section>

          <section aria-labelledby="specs-heading">
            <h2 id="specs-heading" className="text-xl font-semibold tracking-[-0.02em]">
              Specifications
            </h2>
            <dl className="mt-3 divide-y divide-border rounded-card border border-border bg-card">
              <SpecRow label="Brand" value={product.brand || "Not specified"} />
              <SpecRow label="Weight" value={`${product.weight} kg`} />
              <SpecRow
                label="Dimensions"
                value={`${product.length} × ${product.width} × ${product.height} cm`}
              />
              {product.attributes?.map((attribute) => (
                <SpecRow
                  key={`${attribute.key}-${attribute.value}`}
                  label={attribute.key}
                  value={attribute.value}
                />
              ))}
            </dl>
          </section>

          <section aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="text-xl font-semibold tracking-[-0.02em]">
              Delivery
            </h2>
            <div className="mt-3 flex gap-3 rounded-card border border-border bg-secondary/45 p-4">
              <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="space-y-1.5 text-sm leading-6 text-muted-foreground">
                <p className="font-medium text-foreground">Delivered to your saved address</p>
                <p>
                  Delivery and return pickup are included in the final quote. Availability is
                  confirmed when you place the order.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="grid gap-3 sm:grid-cols-3">
              <TrustPoint icon={ShieldCheck} title="Secure payments" body="Handled by Razorpay" />
              <TrustPoint icon={BadgeCheck} title="Verified listing" body="Real details and photos" />
              <TrustPoint icon={Lock} title="Private session" body="HttpOnly cookie auth" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Reviews are coming soon. We are not showing ratings until the feature is available.
            </p>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {categoryLabel}
                </Badge>
                {isOutOfStock ? (
                  <Badge variant="destructive">Currently unavailable</Badge>
                ) : (
                  <Badge variant="success">Available to rent</Badge>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
                {product.productname}
              </h1>
              {product.brand ? (
                <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
              ) : null}

              <div className="mt-4 flex items-baseline gap-2">
                <Price amount={product.price} size="xl" />
                <span className="text-sm text-muted-foreground">base price</span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Choose your plan</h2>
                  {isOutOfStock ? (
                    <span className="text-xs text-destructive">Out of stock</span>
                  ) : null}
                </div>
                <PlanSelector
                  plans={plans}
                  selected={planKey}
                  onSelect={setPlanKey}
                  disabled={isOutOfStock}
                />
                {!subcategoriesQuery.isLoading && !hasPricing ? (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Plan pricing is unavailable for this category. The base price is shown above.
                    Please check back later.
                  </p>
                ) : null}
              </div>

              {hasPricing ? (
                <div className="mt-6 space-y-2 rounded-card border border-border bg-secondary/40 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Rent · {plan.label}
                    </span>
                    <span className="font-medium tabular">{formatINR(selectedPlan.rent)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery + return pickup</span>
                    <span className="font-medium tabular">{formatINR(deliveryCharge * 2)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                    <span className="font-semibold">Estimated total</span>
                    <span className="text-lg font-semibold tabular">
                      {formatINR(selectedPlan.total)}
                    </span>
                  </div>
                  <p className="pt-1 text-xs leading-5 text-muted-foreground">
                    Final amount is confirmed at checkout.
                  </p>
                </div>
              ) : null}

              <div className="mt-5 space-y-2">
                <Button
                  type="button"
                  variant="accent"
                  className="w-full"
                  disabled={isOutOfStock || !hasPricing}
                  onClick={handleRentNow}
                >
                  {isOutOfStock ? "Currently unavailable" : "Rent now"}
                  {!isOutOfStock ? <ArrowRight aria-hidden="true" /> : null}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isOutOfStock || addToCart.isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag aria-hidden="true" />
                  {addToCart.isPending ? "Adding…" : inCart ? "In your cart" : "Add to cart"}
                </Button>
                {!isAuthenticated ? (
                  <p className="text-center text-xs text-muted-foreground">
                    You will be asked to sign in before renting.
                  </p>
                ) : null}
              </div>

              <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                  Secure checkout with Razorpay
                </li>
                <li className="flex items-center gap-2">
                  <Truck aria-hidden="true" className="size-3.5 text-primary" />
                  Delivery + return pickup included in the quote
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight aria-hidden="true" className="size-3.5 text-primary" />
                  Flexible plans from 1 to 24 months
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-2">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{plan.label} · estimated total</p>
            <p className="truncate text-lg font-semibold tabular">
              {hasPricing ? formatINR(selectedPlan.total) : formatINR(product.price)}
            </p>
          </div>
          <Button
            type="button"
            variant="accent"
            disabled={isOutOfStock || !hasPricing}
            onClick={handleRentNow}
          >
            Rent now
          </Button>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3 text-sm">
      <dt className="capitalize text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function TrustPoint({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
