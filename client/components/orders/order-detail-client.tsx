"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  Circle,
  CreditCard,
  PackageX,
  ReceiptText,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { PlanSelector } from "@/components/products/plan-selector";
import { ProductImage } from "@/components/products/product-image";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { DashboardSkeleton } from "@/components/shared/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCancelOrder } from "@/hooks/mutations/use-cancel-order";
import { useRenewOrder } from "@/hooks/mutations/use-renew-order";
import { useVerifyPayment } from "@/hooks/mutations/use-verify-payment";
import { useMyOrders } from "@/hooks/queries/use-my-orders";
import { useProduct, useSubcategories } from "@/hooks/queries/use-catalog";
import { getApiErrorMessage, getApiStatus } from "@/lib/api/errors";
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatINR,
  truncateId,
} from "@/lib/format";
import { ORDER_STATUS_META, orderTotal } from "@/lib/orders";
import { buildRentalPlans, type RentalPlanKey } from "@/lib/pricing";
import { getRazorpayKey, isRazorpayConfigured } from "@/lib/razorpay";
import { useAuth } from "@/providers/auth-provider";
import type { Order } from "@/types/order";
import type { RazorpayOptions, RazorpayPaymentResponse } from "@/types/razorpay";

const CANCEL_FALLBACK =
  "Cancellation is temporarily unavailable. Please try again later.";
const RENEW_FALLBACK = "Renewal is temporarily unavailable. Please try again later.";
const PAYMENT_LOAD_FALLBACK =
  "The secure payment window could not load. Check your connection and try again.";
const VERIFY_FALLBACK =
  "We could not verify your renewal payment. No payment success has been recorded. If money was deducted, contact support with your order id.";

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const ordersQuery = useMyOrders();
  const searchParams = useSearchParams();
  const paymentParam = searchParams.get("payment");
  const actionParam = searchParams.get("action");

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const order = orders.find((item) => item._id === orderId);

  if (ordersQuery.isLoading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <ErrorState
        title="Order could not load"
        message="Check your connection and try again. Your order has not been changed."
        onRetry={() => void ordersQuery.refetch()}
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Order not found"
        description="This order is not in your account. It may belong to a different account or the link may be incorrect."
        action={
          <Button asChild>
            <Link href="/account/orders">Back to orders</Link>
          </Button>
        }
      />
    );
  }

  return (
    <OrderDetailBody
      key={order._id}
      order={order}
      paymentParam={paymentParam}
      actionParam={actionParam}
    />
  );
}

function OrderDetailBody({
  order,
  paymentParam,
  actionParam,
}: {
  order: Order;
  paymentParam: string | null;
  actionParam: string | null;
}) {
  const { user } = useAuth();
  const productQuery = useProduct(order.product);
  const subcategoriesQuery = useSubcategories();
  const cancelOrder = useCancelOrder();
  const renewOrder = useRenewOrder();
  const verifyPayment = useVerifyPayment();

  const [cancelOpen, setCancelOpen] = useState(
    () =>
      actionParam === "cancel" &&
      (order.orderStatus === "confirmed" || order.orderStatus === "shipped"),
  );
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [renewOpen, setRenewOpen] = useState(
    () => actionParam === "renew" && order.orderStatus === "delivered",
  );
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewPlanKey, setRenewPlanKey] = useState<RentalPlanKey>("monthPercent");
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewVerifying, setRenewVerifying] = useState(false);

  const paymentAnnouncedRef = useRef(false);

  const product = productQuery.data;
  const status = ORDER_STATUS_META[order.orderStatus];
  const months = order.duration?.[0];
  const total = orderTotal(order);
  const canCancel = order.orderStatus === "confirmed" || order.orderStatus === "shipped";
  const canRenew = order.orderStatus === "delivered";
  const razorpayConfigured = isRazorpayConfigured();

  const subcategory = subcategoriesQuery.data?.find(
    (item) => item._id === product?.subcategory,
  );

  const pricedRenewPlans = useMemo(
    () =>
      product
        ? buildRentalPlans(product.price, subcategory, {
            dimensions: product,
            includeDelivery: false,
          })
        : [],
    [product, subcategory],
  );

  const selectedRenewPlan =
    pricedRenewPlans.find((plan) => plan.key === renewPlanKey) ?? pricedRenewPlans[0];
  const renewPricingReady = !subcategoriesQuery.isLoading && !subcategoriesQuery.isError;
  const hasRenewPricing =
    renewPricingReady && Boolean(selectedRenewPlan) && selectedRenewPlan.percent !== null;

  useEffect(() => {
    if (paymentAnnouncedRef.current) return;
    if (paymentParam === "success") {
      toast.success("Payment successful. Your rental is confirmed.");
      paymentAnnouncedRef.current = true;
    } else if (paymentParam === "pending") {
      toast("Payment not completed. Your order is saved as payment pending.");
      paymentAnnouncedRef.current = true;
    }
  }, [paymentParam]);

  const handleCancel = () => {
    if (cancelOrder.isPending) return;
    setCancelError(null);
    cancelOrder.mutate(order._id, {
      onSuccess: () => {
        toast.success("Order cancelled.");
        setCancelOpen(false);
      },
      onError: (error) => {
        const apiStatus = getApiStatus(error);
        setCancelError(
          apiStatus && apiStatus >= 500
            ? CANCEL_FALLBACK
            : getApiErrorMessage(error, "We could not cancel this order. Please try again."),
        );
      },
    });
  };

  const runRenewalVerification = async (response: RazorpayPaymentResponse) => {
    setRenewVerifying(true);
    setRenewError(null);
    try {
      await verifyPayment.mutateAsync({ orderId: order._id, payload: response });
      toast.success("Renewal payment successful.");
      setRenewOpen(false);
    } catch (error) {
      const apiStatus = getApiStatus(error);
      setRenewError(
        apiStatus && apiStatus >= 500
          ? VERIFY_FALLBACK
          : getApiErrorMessage(error, VERIFY_FALLBACK),
      );
    } finally {
      setRenewVerifying(false);
    }
  };

  const openRenewalPayment = async (paymentOrderId: string, amountPaise: number) => {
    setRenewLoading(true);
    setRenewError(null);

    let loaded = false;
    try {
      const { loadRazorpay } = await import("@/lib/razorpay");
      loaded = await loadRazorpay();
    } catch {
      loaded = false;
    }

    if (!loaded || !window.Razorpay) {
      setRenewLoading(false);
      setRenewError(PAYMENT_LOAD_FALLBACK);
      return;
    }

    let handlerFired = false;
    let dismissHandled = false;

    const handleDismiss = () => {
      if (handlerFired || dismissHandled) return;
      dismissHandled = true;
      toast("Payment not completed. Your order has not been renewed.");
      setRenewOpen(false);
    };

    const options: RazorpayOptions = {
      key: getRazorpayKey(),
      amount: amountPaise,
      currency: "INR",
      name: "Rentify",
      description: `Renew ${product?.productname ?? "your rental"}`,
      order_id: paymentOrderId,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
      theme: { color: "#0E5A46" },
      handler: (response) => {
        handlerFired = true;
        void runRenewalVerification(response);
      },
      modal: { ondismiss: handleDismiss },
    };

    try {
      const instance = new window.Razorpay(options);
      instance.on("payment.failed", (response) => {
        const description = response.error?.description;
        toast.error(
          description
            ? `Payment failed: ${description}`
            : "Payment failed. Please try again.",
        );
      });
      instance.open();
    } catch {
      setRenewError(PAYMENT_LOAD_FALLBACK);
    } finally {
      setRenewLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!selectedRenewPlan || !hasRenewPricing || renewLoading || renewVerifying) return;
    setRenewError(null);

    let renewal: { paymentOrderId: string; amount: number };
    try {
      renewal = await renewOrder.mutateAsync({ orderId: order._id, planKey: renewPlanKey });
    } catch (error) {
      const apiStatus = getApiStatus(error);
      setRenewError(
        apiStatus && apiStatus >= 500
          ? RENEW_FALLBACK
          : getApiErrorMessage(error, "We could not start your renewal. Please try again."),
      );
      return;
    }

    const amountPaise = Math.round(renewal.amount * 100);
    if (!(amountPaise > 0) || !Number.isFinite(amountPaise)) {
      setRenewError(
        "The renewal amount could not be determined. Your order has not been renewed.",
      );
      return;
    }

    await openRenewalPayment(renewal.paymentOrderId, amountPaise);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to orders
      </Link>

      <PageHeader
        eyebrow={`Order #${truncateId(order._id)}`}
        title={product?.productname ?? "Rental order"}
        description={`Placed ${formatDate(order.createdAt)} · ${formatDuration(months)} rental`}
        actions={
          <Button asChild variant="outline">
            <Link href="/account/orders">All orders</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status.variant}>{status.label}</Badge>
        <Badge variant={order.isPaid ? "success" : "warning"}>
          <CreditCard aria-hidden="true" />
          {order.isPaid ? "Paid" : "Payment pending"}
        </Badge>
        {order.isRefunded ? <Badge variant="secondary">Refunded</Badge> : null}
        {months ? <Badge variant="outline">{formatDuration(months)} plan</Badge> : null}
      </div>

      {paymentParam === "success" ? (
        <div
          role="status"
          className="flex gap-2.5 rounded-card border border-success/25 bg-success/8 p-4 text-sm"
        >
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
          <div>
            <p className="font-medium text-success">Payment successful</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Razorpay verified this payment. Your rental is confirmed.
            </p>
          </div>
        </div>
      ) : null}

      {paymentParam === "pending" ? (
        <div
          role="status"
          className="flex gap-2.5 rounded-card border border-warning/25 bg-warning/8 p-4 text-sm"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="font-medium">Payment pending</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Payment was not completed. This order is saved as payment pending and no payment
              has been taken.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Product</h2>
            <div className="mt-4 flex gap-4">
              <ProductImage
                images={product?.images}
                name={product?.productname ?? "Rental"}
                sizes="(min-width: 640px) 128px, 96px"
                className="size-24 shrink-0 rounded-xl sm:size-32"
              />
              <div className="min-w-0 flex-1">
                {productQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ) : product ? (
                  <>
                    <h3 className="font-semibold">
                      <Link
                        href={`/products/${product._id}`}
                        className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {product.productname}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.brand || "Rental"} · Base price {formatINR(product.price)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.weight} kg · {product.length} × {product.width} × {product.height}{" "}
                      cm
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Owner pincode {order.productPincode || "not provided"}
                    </p>
                  </>
                ) : (
                  <div className="flex gap-2.5">
                    <PackageX aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
                    <div>
                      <p className="text-sm font-medium">Product details unavailable</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        This listing may have been removed. Your order and payment details are
                        still available.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Rental plan</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Plan" value={formatDuration(months)} />
              <InfoRow
                label="Order confirmed"
                value={formatDateTime(order.confirmationDate ?? order.createdAt)}
              />
              <InfoRow
                label="Estimated delivery"
                value={order.deliveryDate ? formatDate(order.deliveryDate) : "Pending"}
              />
              <InfoRow
                label="Return pickup"
                value="Included with the plan"
              />
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Status timeline</h2>
            <OrderTimeline order={order} />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Payment</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Payment status</span>
                <span className="font-medium">
                  {order.isPaid ? "Paid" : "Payment pending"}
                </span>
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-muted-foreground">Razorpay order id</span>
                <span className="break-all text-right font-mono text-xs">
                  {order.paymentOrderId?.length
                    ? order.paymentOrderId
                        .filter(Boolean)
                        .map((paymentId) => truncateId(paymentId, 14))
                        .join(", ")
                    : "Not available"}
                </span>
              </div>
            </div>

            {!order.isPaid ? (
              <p className="mt-4 rounded-input border border-warning/25 bg-warning/8 px-3 py-2 text-xs leading-5 text-muted-foreground">
                No payment has been taken for this order. It is saved as payment pending. This
                page never shows a successful payment unless Razorpay verification succeeds.
              </p>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Price breakdown</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Rent</dt>
                <dd className="font-medium tabular">{formatINR(order.price?.[0] ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Delivery + return pickup</dt>
                <dd className="font-medium tabular">
                  {formatINR(2 * (order.deliveryCharge ?? 0))}
                </dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <dt className="font-semibold">Total</dt>
                <dd>
                  <Price amount={total} size="default" />
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Renewals are charged separately for their new rental term.
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Actions</h2>
            <div className="mt-4 space-y-3">
              {canCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCancelError(null);
                    setCancelOpen(true);
                  }}
                >
                  Cancel order
                </Button>
              ) : null}
              {canRenew ? (
                <Button
                  type="button"
                  variant="accent"
                  className="w-full"
                  onClick={() => {
                    setRenewError(null);
                    setRenewOpen(true);
                  }}
                  disabled={!razorpayConfigured}
                >
                  Renew rental
                </Button>
              ) : null}
              {!canCancel && !canRenew ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  No actions are available for this order in its current state.
                </p>
              ) : null}
              {canRenew && !razorpayConfigured ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  Renewal payment is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to enable
                  it.
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (cancelOrder.isPending) return;
          setCancelOpen(open);
          if (!open) setCancelError(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This cancels the rental for {product?.productname ?? "this product"}. This action
              cannot be undone. Refunds, if any, are handled by Rentify support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelError ? (
            <p role="alert" className="text-sm leading-6 text-destructive">
              {cancelError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelOrder.isPending}>Keep order</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelOrder.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleCancel();
              }}
            >
              {cancelOrder.isPending ? "Cancelling…" : "Cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={renewOpen}
        onOpenChange={(open) => {
          if (renewLoading || renewVerifying) return;
          setRenewOpen(open);
          if (!open) setRenewError(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Renew this rental</DialogTitle>
            <DialogDescription>
              Choose a new plan. You pay the rent for the new term; delivery is not charged
              again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {subcategoriesQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-20 rounded-input" />
                ))}
              </div>
            ) : (
              <PlanSelector
                plans={pricedRenewPlans}
                selected={renewPlanKey}
                onSelect={setRenewPlanKey}
                disabled={renewLoading || renewVerifying}
              />
            )}

            {!renewPricingReady ? (
              <p className="text-xs leading-5 text-muted-foreground">
                Plan pricing is still loading.
              </p>
            ) : !hasRenewPricing ? (
              <p className="text-xs leading-5 text-muted-foreground">
                Plan pricing is unavailable for this category. Renewal is disabled until
                pricing is available.
              </p>
            ) : selectedRenewPlan ? (
              <div className="flex items-center justify-between gap-3 rounded-input border border-border bg-secondary/40 px-3 py-2.5 text-sm">
                <span className="text-muted-foreground">
                  {formatDuration(selectedRenewPlan.months)} renewal rent
                </span>
                <span className="font-semibold tabular">
                  {formatINR(selectedRenewPlan.rent)}
                </span>
              </div>
            ) : null}

            {renewError ? (
              <p role="alert" className="text-sm leading-6 text-destructive">
                {renewError}
              </p>
            ) : null}

            {!razorpayConfigured ? (
              <p className="text-xs leading-5 text-muted-foreground">
                Online payment is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to enable
                renewal.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenewOpen(false)}
              disabled={renewLoading || renewVerifying}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={() => void handleRenew()}
              disabled={
                !hasRenewPricing ||
                !razorpayConfigured ||
                renewLoading ||
                renewVerifying ||
                !selectedRenewPlan
              }
            >
              {renewLoading
                ? "Starting renewal…"
                : renewVerifying
                  ? "Verifying…"
                  : "Continue to payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

interface TimelineStep {
  label: string;
  date?: string;
  state: "done" | "pending" | "cancelled";
}

function OrderTimeline({ order }: { order: Order }) {
  const steps: TimelineStep[] = useMemo(() => {
    if (order.orderStatus === "cancelled") {
      return [
        {
          label: "Order confirmed",
          date: order.confirmationDate ?? order.createdAt,
          state: "done",
        },
        { label: "Order cancelled", date: order.cancelDate, state: "cancelled" },
      ];
    }

    const shipped =
      order.orderStatus === "shipped" ||
      order.orderStatus === "delivered" ||
      order.orderStatus === "returned";
    const delivered =
      order.orderStatus === "delivered" || order.orderStatus === "returned";
    const returned = order.orderStatus === "returned";

    return [
      {
        label: "Order confirmed",
        date: order.confirmationDate ?? order.createdAt,
        state: "done",
      },
      { label: "Shipped", date: order.shippingDate, state: shipped ? "done" : "pending" },
      {
        label: "Delivered",
        date: order.deliveryDate,
        state: delivered ? "done" : "pending",
      },
      { label: "Returned", date: order.returnDate, state: returned ? "done" : "pending" },
    ];
  }, [order]);

  return (
    <ol className="mt-5 space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = step.state === "done";
        const cancelled = step.state === "cancelled";
        return (
          <li key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${
                  done ? "bg-primary/30" : "bg-border"
                }`}
              />
            ) : null}
            <span
              className={`relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${
                cancelled
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : done
                    ? "border-primary/30 bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              {cancelled ? (
                <X aria-hidden="true" className="size-3" strokeWidth={2.5} />
              ) : done ? (
                <Check aria-hidden="true" className="size-3" strokeWidth={2.5} />
              ) : (
                <Circle aria-hidden="true" className="size-2 fill-current" />
              )}
            </span>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${cancelled ? "text-destructive" : ""}`}>
                {step.label}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {step.date
                  ? formatDateTime(step.date)
                  : step.state === "pending"
                    ? "Pending"
                    : "Date not recorded"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
