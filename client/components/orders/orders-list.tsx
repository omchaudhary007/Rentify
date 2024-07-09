"use client";

import { useQueries } from "@tanstack/react-query";
import {
  CreditCard,
  Package,
  PackageX,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductImage } from "@/components/products/product-image";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyOrders } from "@/hooks/queries/use-my-orders";
import { getProduct } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/api/query-keys";
import { formatDate, pluralize, truncateId } from "@/lib/format";
import { ORDER_STATUS_META, orderTotal } from "@/lib/orders";
import type { Product } from "@/types/product";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_TABS: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

export function OrdersList() {
  const ordersQuery = useMyOrders();
  const [activeTab, setActiveTab] = useState<string>("all");
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);

  const productIds = useMemo(
    () => Array.from(new Set(orders.map((order) => order.product).filter(Boolean))),
    [orders],
  );

  const productQueries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => getProduct(id),
      staleTime: 60_000,
      retry: false,
    })),
  });

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    productQueries.forEach((query, index) => {
      if (query.data) map.set(productIds[index], query.data);
    });
    return map;
  }, [productIds, productQueries]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: orders.length };
    orders.forEach((order) => {
      result[order.orderStatus] = (result[order.orderStatus] ?? 0) + 1;
    });
    return result;
  }, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your rentals"
        title="Orders"
        description="Track every rental, payment, and delivery in one place."
        actions={
          <Button asChild>
            <Link href="/products">
              <ShoppingBag aria-hidden="true" />
              Browse rentals
            </Link>
          </Button>
        }
      />

      {ordersQuery.isLoading ? (
        <OrdersSkeleton />
      ) : ordersQuery.isError ? (
        <ErrorState
          title="Orders could not load"
          message="Check your connection and try again. Your saved rentals are not affected."
          onRetry={() => void ordersQuery.refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you rent something, your order and delivery details will appear here."
          action={
            <Button asChild>
              <Link href="/products">Browse rentals</Link>
            </Button>
          }
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList variant="line" className="h-auto min-w-full justify-start sm:min-w-0">
              {STATUS_TABS.map((tab) => {
                const count = counts[tab.value] ?? 0;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="shrink-0 px-3 py-2">
                    {tab.label}
                    <span className="text-xs text-muted-foreground tabular">({count})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {STATUS_TABS.map((tab) => {
            const filtered =
              tab.value === "all"
                ? orders
                : orders.filter((order) => order.orderStatus === tab.value);

            return (
              <TabsContent key={tab.value} value={tab.value} className="mt-5">
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title={`No ${tab.label.toLowerCase()} orders`}
                    description="Orders will appear here when their status matches this tab."
                  />
                ) : (
                  <ul className="space-y-3">
                    {filtered.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        product={productMap.get(order.product)}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

function OrderCard({ order, product }: { order: Order; product?: Product }) {
  const status = ORDER_STATUS_META[order.orderStatus];
  const months = order.duration?.[0];
  const total = orderTotal(order);
  const productMissing = !product;
  const orderHref = `/account/orders/${order._id}`;
  const canCancel = order.orderStatus === "confirmed" || order.orderStatus === "shipped";
  const canRenew = order.orderStatus === "delivered";

  return (
    <li>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
          <Link
            href={orderHref}
            tabIndex={-1}
            aria-hidden="true"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ProductImage
              images={product?.images}
              name={product?.productname ?? "Rental"}
              sizes="(min-width: 640px) 112px, 80px"
              className="size-20 rounded-xl sm:size-28"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">
                  {product ? (
                    <Link
                      href={`/products/${product._id}`}
                      className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {product.productname}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Product no longer available</span>
                  )}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Order #{truncateId(order._id)} · Placed {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={order.isPaid ? "success" : "warning"}>
                <CreditCard aria-hidden="true" />
                {order.isPaid ? "Paid" : "Payment pending"}
              </Badge>
              <Badge variant="outline">
                {months ? `${pluralize(months, "month")} rental` : "Rental plan"}
              </Badge>
              {order.isRefunded ? <Badge variant="secondary">Refunded</Badge> : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Truck aria-hidden="true" className="size-3.5" />
                {order.deliveryDate
                  ? `Delivered ${formatDate(order.deliveryDate)}`
                  : order.shippingDate
                    ? `Shipped ${formatDate(order.shippingDate)}`
                    : "Delivery date pending"}
              </span>
              {productMissing ? (
                <span className="flex items-center gap-1.5 text-warning">
                  <PackageX aria-hidden="true" className="size-3.5" />
                  Product details unavailable
                </span>
              ) : null}
            </div>

            {!order.isPaid ? (
              <p className="mt-3 rounded-input border border-warning/25 bg-warning/8 px-3 py-2 text-xs leading-5 text-muted-foreground">
                This order is saved as payment pending. No payment has been taken for this
                order yet.
              </p>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-border pt-3 sm:w-44 sm:flex-col sm:items-end sm:justify-between sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="text-left sm:text-right">
              <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                Total
              </p>
              <Price amount={total} size="sm" />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canCancel ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${orderHref}?action=cancel`}>Cancel</Link>
                </Button>
              ) : null}
              {canRenew ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${orderHref}?action=renew`}>Renew</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={orderHref} aria-label={`View order ${truncateId(order._id)}`}>
                  View order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </li>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-9 w-full max-w-xl rounded-input" />
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-card border border-border bg-card p-4 sm:p-5">
          <div className="flex gap-4">
            <Skeleton className="size-20 rounded-xl sm:size-28" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
