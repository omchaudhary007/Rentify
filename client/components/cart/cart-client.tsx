"use client";

import { ArrowRight, Info, PackageX, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import Link from "next/link";

import { ProductImage } from "@/components/products/product-image";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { ListRowsSkeleton } from "@/components/shared/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/queries/use-cart";
import { useClearCart, useRemoveFromCart } from "@/hooks/mutations/use-cart-mutations";
import { getApiErrorMessage } from "@/lib/api/errors";
import { pluralize } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import type { Product } from "@/types/product";

export function CartClient() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const isRenter = user?.role === "user";
  const cartQuery = useCart(isAuthenticated && isRenter);
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  const items = cartQuery.data?.cartItems ?? [];
  const count = items.length || (cartQuery.data?.itemCount ?? 0);

  return (
    <div className="container-page py-8 md:py-12">
      <PageHeader
        eyebrow="Saved rentals"
        title="Your cart"
        description="Keep rentals you are considering here. Each item is rented separately with its own plan and delivery."
      />

      {isLoading ? (
        <div className="mt-8">
          <ListRowsSkeleton rows={3} />
        </div>
      ) : !isAuthenticated ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Sign in to see your cart"
            description="Your saved rentals are linked to your Rentify account."
            action={
              <Button asChild>
                <Link href="/login?next=/cart">Sign in</Link>
              </Button>
            }
          />
        </div>
      ) : !isRenter ? (
        <div className="mt-8">
          <EmptyState
            icon={PackageX}
            title="Carts are for renter accounts"
            description="Only renter accounts can save rentals and check out. Switch to a renter account to continue."
            action={
              <Button asChild>
                <Link href="/products">Browse rentals</Link>
              </Button>
            }
          />
        </div>
      ) : cartQuery.isLoading ? (
        <div className="mt-8">
          <ListRowsSkeleton rows={3} />
        </div>
      ) : cartQuery.isError ? (
        <div className="mt-8">
          <ErrorState
            title="Your cart could not load"
            message={getApiErrorMessage(
              cartQuery.error,
              "Check your connection and try again.",
            )}
            onRetry={() => void cartQuery.refetch()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Save a rental from any product page and it will appear here."
            action={
              <Button asChild>
                <Link href="/products">
                  Browse rentals
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {pluralize(count, "saved rental")}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={clearCart.isPending}>
                    {clearCart.isPending ? "Clearing…" : "Clear cart"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes all saved rentals. You can add them again from their product
                      pages.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={clearCart.isPending}>Keep cart</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={clearCart.isPending}
                      onClick={(event) => {
                        event.preventDefault();
                        clearCart.mutate();
                      }}
                    >
                      {clearCart.isPending ? "Clearing…" : "Clear cart"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <ul className="space-y-3">
              {items.map((product) => (
                <CartRow
                  key={product._id}
                  product={product}
                  removing={
                    removeFromCart.isPending && removeFromCart.variables === product._id
                  }
                  onRemove={() => removeFromCart.mutate(product._id)}
                />
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <Card className="p-5 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Before you checkout</h2>
              <div className="mt-4 space-y-3">
                <CartNote icon={Info} title="Plans are chosen per item">
                  Rent is calculated from the plan you choose at checkout, not from the base
                  price.
                </CartNote>
                <CartNote icon={ShoppingBag} title="Each item is rented separately">
                  Every rental is its own order. There is no combined checkout.
                </CartNote>
                <CartNote icon={Truck} title="Delivery is quoted per order">
                  Delivery and return pickup are added to each order at checkout.
                </CartNote>
              </div>

              <Separator className="my-5" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saved rentals</span>
                <span className="font-medium tabular">{count}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant="secondary">
                  <ShieldCheck aria-hidden="true" />
                  Secured by Razorpay
                </Badge>
              </div>

              <p className="mt-5 text-xs leading-5 text-muted-foreground">
                Choose a plan on any item to continue. Your cart is saved to your account.
              </p>

              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href="/products">Keep browsing</Link>
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function CartRow({
  product,
  removing,
  onRemove,
}: {
  product: Product;
  removing: boolean;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-4 rounded-card border border-border bg-card p-3 sm:p-4">
      <Link
        href={`/products/${product._id}`}
        className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${product.productname}`}
      >
        <ProductImage
          images={product.images}
          name={product.productname}
          sizes="(max-width: 640px) 88px, 112px"
          className="size-24 rounded-xl sm:size-28"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${product._id}`}
              className="line-clamp-2 font-semibold leading-snug tracking-[-0.01em] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {product.productname}
            </Link>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {product.brand || "Rental"} · 1–24 month plans
            </p>
          </div>
          {product.outofStock ? <Badge variant="destructive">Unavailable</Badge> : null}
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <Price amount={product.price} size="sm" />
          <span className="text-xs text-muted-foreground">base price</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            disabled={removing}
            onClick={onRemove}
          >
            <Trash2 aria-hidden="true" />
            {removing ? "Removing…" : "Remove"}
          </Button>
          {product.outofStock ? (
            <Button type="button" size="sm" disabled>
              Currently unavailable
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/checkout/${product._id}`}>
                Choose plan
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function CartNote({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
