"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FolderTree,
  Package,
  Percent,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { ProductImage } from "@/components/products/product-image";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/queries/use-catalog";
import { useCart } from "@/hooks/queries/use-cart";
import { useMyOrders } from "@/hooks/queries/use-my-orders";
import { formatDate, initials, truncateId } from "@/lib/format";
import { ORDER_STATUS_META, orderTotal } from "@/lib/orders";
import { useAuth } from "@/providers/auth-provider";
import type { Order } from "@/types/order";

export function AccountOverview() {
  const { user } = useAuth();
  const isRenter = user?.role === "user";
  const ordersQuery = useMyOrders(isRenter);
  const cartQuery = useCart(isRenter);

  if (!user) return null;

  const address = user.address;
  const completenessFields = [
    user.name,
    user.phone,
    address?.placeName,
    address?.postalcode,
    address?.city,
    address?.state,
    address?.country,
  ];
  const completed = completenessFields.filter(Boolean).length;
  const percent = Math.round((completed / completenessFields.length) * 100);
  const orders = ordersQuery.data ?? [];
  const activeOrders = orders.filter(
    (order) => order.orderStatus === "confirmed" || order.orderStatus === "delivered",
  ).length;
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={roleEyebrow(user.role)}
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={roleDescription(user.role)}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/account/profile">Edit profile</Link>
            </Button>
            {isRenter ? (
              <Button asChild>
                <Link href="/products">Browse rentals</Link>
              </Button>
            ) : null}
          </>
        }
      />

      {user.role === "deliveryman" && !user.isVerified ? (
        <div className="flex gap-2.5 rounded-card border border-warning/30 bg-warning/10 p-4 text-sm">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="font-medium">Your delivery partner account is pending verification</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              An admin needs to approve your account before you can accept deliveries. You can
              still update your profile and security settings.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="p-5 md:col-span-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Profile completeness</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A complete profile helps deliveries reach the right address.
              </p>
            </div>
            <span className="text-2xl font-semibold tabular">{percent}%</span>
          </div>
          <Progress value={percent} className="mt-4 h-2" aria-label="Profile completeness" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {percent === 100
                ? "Everything looks complete."
                : `${completenessFields.length - completed} field${completenessFields.length - completed === 1 ? "" : "s"} left to add.`}
            </p>
            <Button asChild variant={percent === 100 ? "ghost" : "outline"} size="sm">
              <Link href="/account/profile">
                {percent === 100 ? "Review profile" : "Complete profile"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              {user.role === "admin" ? (
                <ShieldCheck aria-hidden="true" className="size-5" />
              ) : user.role === "deliveryman" ? (
                <Truck aria-hidden="true" className="size-5" />
              ) : (
                <UserRound aria-hidden="true" className="size-5" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">{roleTitle(user.role)}</p>
              <p className="text-xs text-muted-foreground">
                {user.isVerified ? "Verified account" : "Verification pending"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {initials(user.name)}
            </span>
            <span className="truncate">{user.email}</span>
          </div>
        </Card>
      </div>

      {isRenter ? (
        <>
          <section aria-labelledby="quick-stats">
            <h2 id="quick-stats" className="sr-only">
              Quick stats
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label="Total orders"
                value={ordersQuery.isLoading ? null : ordersQuery.isError ? undefined : orders.length}
                icon={Package}
                href="/account/orders"
                onRetry={() => void ordersQuery.refetch()}
              />
              <StatCard
                label="Active rentals"
                value={ordersQuery.isLoading ? null : ordersQuery.isError ? undefined : activeOrders}
                icon={CheckCircle2}
                href="/account/orders"
                onRetry={() => void ordersQuery.refetch()}
              />
              <StatCard
                label="Saved in cart"
                value={cartQuery.isLoading ? null : cartQuery.isError ? undefined : cartQuery.data?.itemCount ?? 0}
                icon={ShoppingBag}
                href="/cart"
                onRetry={() => void cartQuery.refetch()}
              />
            </div>
          </section>

          <section aria-labelledby="recent-orders">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="recent-orders" className="text-xl font-semibold tracking-[-0.02em]">
                  Recent orders
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your latest rentals and their current status.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account/orders">View all</Link>
              </Button>
            </div>

            <div className="mt-4">
              {ordersQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }, (_, index) => (
                    <Skeleton key={index} className="h-28 rounded-card" />
                  ))}
                </div>
              ) : ordersQuery.isError ? (
                <div className="rounded-card border border-destructive/20 bg-destructive/5 p-5 text-center">
                  <p className="text-sm font-medium">Orders could not load</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This does not affect the rest of your account.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void ordersQuery.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="rounded-card border border-dashed border-border bg-card px-5 py-8 text-center">
                  <p className="text-sm font-medium">No orders yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    When you rent something, it will show up here.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/products">Browse rentals</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentOrders.map((order) => (
                    <RecentOrder key={order._id} order={order} />
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section aria-labelledby="quick-actions">
            <h2 id="quick-actions" className="text-xl font-semibold tracking-[-0.02em]">
              Quick actions
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <QuickAction
                href="/products"
                icon={ShoppingBag}
                title="Find a rental"
                body="Browse furniture, electronics, and more."
              />
              <QuickAction
                href="/listings/new"
                icon={Plus}
                title="List a product"
                body="Earn by renting out something you own."
              />
              <QuickAction
                href="/account/profile"
                icon={UserRound}
                title="Edit profile"
                body="Keep your contact and address details current."
              />
            </div>
          </section>
        </>
      ) : null}

      {user.role === "deliveryman" ? (
        <section aria-labelledby="delivery-actions">
          <h2 id="delivery-actions" className="text-xl font-semibold tracking-[-0.02em]">
            Delivery tools
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              href="/delivery"
              icon={Truck}
              title="Delivery queue"
              body="See orders waiting to be delivered."
            />
            <QuickAction
              href="/account/security"
              icon={ShieldCheck}
              title="Account security"
              body="Update your email, password, or account."
            />
          </div>
        </section>
      ) : null}

      {user.role === "admin" ? (
        <section aria-labelledby="admin-actions">
          <h2 id="admin-actions" className="text-xl font-semibold tracking-[-0.02em]">
            Admin tools
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              href="/admin/categories"
              icon={FolderTree}
              title="Categories"
              body="Create and update top-level categories."
            />
            <QuickAction
              href="/admin/subcategories"
              icon={Percent}
              title="Subcategories"
              body="Manage rental plans and percentages."
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  onRetry,
}: {
  label: string;
  value: number | null | undefined;
  icon: typeof Package;
  href: string;
  onRetry: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon aria-hidden="true" className="size-4 text-primary" />
      </div>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : value === undefined ? (
        <div className="mt-3">
          <p className="text-lg font-semibold text-muted-foreground">Unavailable</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      ) : (
        <p className="mt-2 text-3xl font-semibold tabular">{value}</p>
      )}
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Open
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </Card>
  );
}

function RecentOrder({ order }: { order: Order }) {
  const productQuery = useProduct(order.product);
  const status = ORDER_STATUS_META[order.orderStatus];

  return (
    <li>
      <Link
        href={`/account/orders/${order._id}`}
        className="flex gap-4 rounded-card border border-border bg-card p-3 transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
      >
        <ProductImage
          images={productQuery.data?.images}
          name={productQuery.data?.productname ?? "Rental"}
          sizes="88px"
          className="size-20 shrink-0 rounded-xl sm:size-24"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {productQuery.data?.productname ?? "Rental order"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                #{truncateId(order._id)} · {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
            <span className="text-sm text-muted-foreground">
              {order.duration?.[0] ? `${order.duration[0]} month rental` : "Rental"}
            </span>
            <Price amount={orderTotal(order)} size="sm" />
          </div>
        </div>
      </Link>
    </li>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: typeof Package;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-card border border-border bg-card p-4 transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </Link>
  );
}

function roleEyebrow(role: string): string {
  if (role === "admin") return "Admin";
  if (role === "deliveryman") return "Delivery partner";
  return "Your account";
}

function roleDescription(role: string): string {
  if (role === "admin") return "Manage categories, rental plans, and your account settings.";
  if (role === "deliveryman") return "Your delivery queue and account settings in one place.";
  return "Your rentals, orders, and saved items in one place.";
}

function roleTitle(role: string): string {
  if (role === "admin") return "Administrator";
  if (role === "deliveryman") return "Delivery partner";
  return "Renter";
}
