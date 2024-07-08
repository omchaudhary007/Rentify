"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Info,
  Lock,
  MapPin,
  PackageX,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PlanSelector } from "@/components/products/plan-selector";
import { ProductImage } from "@/components/products/product-image";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateOrder } from "@/hooks/mutations/use-create-order";
import { useVerifyPayment } from "@/hooks/mutations/use-verify-payment";
import { useProduct, useSubcategories } from "@/hooks/queries/use-catalog";
import { getApiErrorMessage, getApiStatus } from "@/lib/api/errors";
import { formatINR, formatDuration, truncateId } from "@/lib/format";
import { orderTotal } from "@/lib/orders";
import {
  buildRentalPlans,
  calculateDeliveryCharge,
  isRentalPlanKey,
  type RentalPlanKey,
} from "@/lib/pricing";
import { getRazorpayKey, isRazorpayConfigured } from "@/lib/razorpay";
import { useAuth } from "@/providers/auth-provider";
import type { Order } from "@/types/order";
import type { RazorpayOptions, RazorpayPaymentResponse } from "@/types/razorpay";

const CHECKOUT_FALLBACK =
  "Checkout is temporarily unavailable. Your selection is saved. Please try again later.";
const PAYMENT_LOAD_FALLBACK =
  "The secure payment window could not load. Check your connection and try again.";
const VERIFY_FALLBACK =
  "We could not verify your payment. No payment success has been recorded. If money was deducted, contact support with your order id.";

interface PendingPayment {
  order: Order;
  paymentOrderId: string;
  amountPaise: number;
}

export function CheckoutClient({ productId }: { productId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const productQuery = useProduct(productId);
  const subcategoriesQuery = useSubcategories();
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [lastPaymentResponse, setLastPaymentResponse] =
    useState<RazorpayPaymentResponse | null>(null);
  const handlerFiredRef = useRef(false);


  const planParam = searchParams.get("plan");
  const planKey: RentalPlanKey = isRentalPlanKey(planParam) ? planParam : "monthPercent";

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
          title="Checkout could not load"
          message="Check your connection and try again."
          onRetry={() => void productQuery.refetch()}
        />
      </div>
    );
  }

  const product = productQuery.data;
  if (!product || !user) return null;

  const subcategory = subcategoriesQuery.data?.find(
    (item) => item._id === product.subcategory,
  );
  const plans = buildRentalPlans(product.price, subcategory, {
    dimensions: product,
    includeDelivery: true,
  });
  const selectedPlan = plans.find((item) => item.key === planKey) ?? plans[0];
  const deliveryCharge = calculateDeliveryCharge(product);
  const pricingReady = !subcategoriesQuery.isLoading && !subcategoriesQuery.isError;
  const hasPricing = pricingReady && selectedPlan.percent !== null;

  const address = user.address;
  const hasAddress = Boolean(
    address?.placeName &&
      address?.postalcode &&
      address?.city &&
      address?.state &&
      address?.country,
  );

  const razorpayConfigured = isRazorpayConfigured();
  const amountInvalid = pendingPayment !== null && !(pendingPayment.amountPaise > 0);

  const disabledReason = !razorpayConfigured
    ? "Online payment is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to enable checkout."
    : product.outofStock
      ? "This rental is currently unavailable."
      : !hasAddress
        ? "Add a delivery address before checking out."
        : !pricingReady
          ? "Rental plans are still loading."
          : !hasPricing
            ? "Plan pricing is unavailable for this category."
            : amountInvalid
              ? "The payment amount for this order is invalid. Do not create another order."
              : null;

  const canContinue =
    !disabledReason &&
    !createOrder.isPending &&
    !paymentLoading &&
    !verifying;

  const handlePlanChange = (nextPlan: RentalPlanKey) => {
    if (pendingPayment || createOrder.isPending) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("plan", nextPlan);
    router.replace(`/checkout/${productId}?${params.toString()}`, { scroll: false });
  };

  const runVerification = async (
    context: PendingPayment,
    response: RazorpayPaymentResponse,
  ) => {
    setVerifying(true);
    setPaymentError(null);
    setLastPaymentResponse(response);

    try {
      await verifyPayment.mutateAsync({
        orderId: context.order._id,
        payload: response,
      });
      toast.success("Payment successful.");
      router.push(`/account/orders/${context.order._id}?payment=success`);
    } catch (error) {
      const status = getApiStatus(error);
      setPaymentError(
        status && status >= 500
          ? VERIFY_FALLBACK
          : getApiErrorMessage(error, VERIFY_FALLBACK),
      );
    } finally {
      setVerifying(false);
    }
  };

  const openRazorpay = async (context: PendingPayment) => {
    setPaymentError(null);
    setPaymentLoading(true);
    handlerFiredRef.current = false;

    let loaded = false;
    try {
      const { loadRazorpay } = await import("@/lib/razorpay");
      loaded = await loadRazorpay();
    } catch {
      loaded = false;
    }

    if (!loaded || !window.Razorpay) {
      setPaymentLoading(false);
      setPaymentError(PAYMENT_LOAD_FALLBACK);
      return;
    }

    const options: RazorpayOptions = {
      key: getRazorpayKey(),
      amount: context.amountPaise,
      currency: "INR",
      name: "Rentify",
      description: product.productname,
      order_id: context.paymentOrderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      theme: { color: "#0E5A46" },
      handler: (response) => {
        handlerFiredRef.current = true;
        void runVerification(context, response);
      },
      modal: {
        ondismiss: () => {
          if (handlerFiredRef.current) return;
          toast("Payment not completed. Your order is saved as payment pending.");
          router.push(`/account/orders/${context.order._id}?payment=pending`);
        },
      },
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
      setPaymentError(PAYMENT_LOAD_FALLBACK);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setCheckoutError(null);

    if (pendingPayment) {
      void openRazorpay(pendingPayment);
      return;
    }

    createOrder.mutate(
      { productId, planKey },
      {
        onSuccess: ({ order, paymentOrderId }) => {
          const amountPaise = Math.round(orderTotal(order) * 100);
          const context: PendingPayment = { order, paymentOrderId, amountPaise };
          setPendingPayment(context);

          if (!(amountPaise > 0) || !Number.isFinite(amountPaise)) {
            setPaymentError(
              "The order was created, but its payment amount could not be calculated. Please do not pay again. Contact support with the order id below.",
            );
            toast.error("Order created, but the payment amount is invalid.");
            return;
          }

          toast.success("Order created. Opening secure payment.");
          void openRazorpay(context);
        },
        onError: (error) => {
          const status = getApiStatus(error);
          setCheckoutError(
            status && status >= 500
              ? CHECKOUT_FALLBACK
              : getApiErrorMessage(error, CHECKOUT_FALLBACK),
          );
        },
      },
    );
  };

  const handleRetryVerification = () => {
    if (!pendingPayment || !lastPaymentResponse || verifying) return;
    void runVerification(pendingPayment, lastPaymentResponse);
  };


  return (
    <div className="container-page pb-32 pt-6 md:py-10 lg:pb-12">
      <Link
        href={`/products/${product._id}`}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to product
      </Link>

      <PageHeader
        className="mt-6"
        eyebrow="Checkout"
        title="Review your rental"
        description="Choose a plan and confirm your delivery address. You will only be charged after payment is completed."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-caption text-primary">Step 1</p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Rental plan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how long you want to keep this item.
                </p>
              </div>
              <span className="rounded-pill bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {formatDuration(selectedPlan.months)}
              </span>
            </div>

            <div className="mt-5">
              {subcategoriesQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-20 rounded-input" />
                  ))}
                </div>
              ) : (
                <PlanSelector
                  plans={plans}
                  selected={planKey}
                  onSelect={handlePlanChange}
                  disabled={product.outofStock || Boolean(pendingPayment)}
                />
              )}
            </div>

            {!subcategoriesQuery.isLoading && !hasPricing ? (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Plan pricing is unavailable for this category. You can still review the base
                price, but checkout is disabled until pricing is available.
              </p>
            ) : null}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-caption text-primary">Step 2</p>
                <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                  Delivery address
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The address saved on your account.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/account/profile">Edit address</Link>
              </Button>
            </div>

            <div className="mt-5 rounded-card border border-border bg-secondary/40 p-4">
              {hasAddress ? (
                <div className="flex gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <address className="text-sm not-italic leading-6">
                    <span className="font-medium">{user.name}</span>
                    <br />
                    {address.landmark ? `${address.landmark}, ` : null}
                    {address.placeName}
                    <br />
                    {address.city}, {address.state} {address.postalcode}
                    <br />
                    {address.country}
                    <br />
                    <span className="text-muted-foreground">{user.phone}</span>
                  </address>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-medium">Your address is incomplete</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Add your locality, postal code, city, state, and country before checking
                      out.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-3 flex gap-2 text-xs leading-5 text-muted-foreground">
              <Truck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
              Delivery availability is confirmed when you place the order. Delivery and return
              pickup are included in the estimate below.
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <p className="text-caption text-primary">Step 3</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Review</h2>
            <dl className="mt-4 divide-y divide-border rounded-card border border-border">
              <div className="flex items-center gap-3 p-3">
                <ProductImage
                  images={product.images}
                  name={product.productname}
                  sizes="64px"
                  className="size-16 shrink-0 rounded-xl"
                />
                <div className="min-w-0">
                  <dt className="truncate text-sm font-medium">{product.productname}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">
                    {product.brand || "Rental"} · {formatDuration(selectedPlan.months)} plan
                  </dd>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <dt className="text-muted-foreground">Rent</dt>
                <dd className="font-medium tabular">
                  {hasPricing ? formatINR(selectedPlan.rent) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <dt className="text-muted-foreground">Delivery + return pickup</dt>
                <dd className="font-medium tabular">
                  {hasPricing ? formatINR(deliveryCharge * 2) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 bg-secondary/35 px-3 py-3 text-sm">
                <dt className="font-semibold">Estimated total</dt>
                <dd className="text-lg font-semibold tabular">
                  {hasPricing ? formatINR(selectedPlan.total) : formatINR(product.price)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 flex gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-success" />
              The final amount is confirmed by Rentify when the order is created.
            </p>
          </Card>

          {checkoutError ? (
            <div
              role="alert"
              className="rounded-card border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <p className="font-medium">We could not create your order</p>
              <p className="mt-1 leading-6">{checkoutError}</p>
            </div>
          ) : null}

          {paymentError ? (
            <div
              role="alert"
              className="rounded-card border border-destructive/25 bg-destructive/5 p-4 text-sm"
            >
              <p className="flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle aria-hidden="true" className="size-4" />
                Payment not completed
              </p>
              <p className="mt-1 leading-6 text-muted-foreground">{paymentError}</p>
              {pendingPayment ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Order reference: #{truncateId(pendingPayment.order._id)}
                </p>
              ) : null}
              {lastPaymentResponse && pendingPayment ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleRetryVerification}
                  disabled={verifying}
                >
                  {verifying ? "Verifying…" : "Retry verification"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Order summary</h2>

              <div className="mt-4 flex items-center gap-3">
                <ProductImage
                  images={product.images}
                  name={product.productname}
                  sizes="64px"
                  className="size-16 shrink-0 rounded-xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{product.productname}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDuration(selectedPlan.months)} · {selectedPlan.label}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Rent</span>
                  <span className="font-medium tabular">
                    {hasPricing ? formatINR(selectedPlan.rent) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Delivery + pickup</span>
                  <span className="font-medium tabular">
                    {hasPricing ? formatINR(deliveryCharge * 2) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="font-semibold">Estimated total</span>
                  <span className="text-xl font-semibold tabular">
                    {hasPricing ? formatINR(selectedPlan.total) : "—"}
                  </span>
                </div>
              </div>

              {pendingPayment ? (
                <div
                  role="status"
                  className="mt-5 rounded-card border border-warning/25 bg-warning/8 p-4 text-sm"
                >
                  <p className="flex items-center gap-2 font-medium text-warning">
                    <AlertTriangle aria-hidden="true" className="size-4" />
                    Order saved as payment pending
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Order #{truncateId(pendingPayment.order._id)} was created. No payment has
                    been taken yet. Complete payment in the Razorpay window to confirm your
                    rental.
                  </p>
                </div>
              ) : null}

              {!razorpayConfigured ? (
                <div
                  role="alert"
                  className="mt-5 rounded-card border border-destructive/25 bg-destructive/5 p-4 text-sm"
                >
                  <p className="flex items-center gap-2 font-medium text-destructive">
                    <AlertTriangle aria-hidden="true" className="size-4" />
                    Online payment is not configured
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Add NEXT_PUBLIC_RAZORPAY_KEY_ID to the environment to enable checkout.
                    No order will be created until payment is configured.
                  </p>
                </div>
              ) : null}

              <Button
                type="button"
                variant="accent"
                className="mt-5 w-full"
                onClick={handleContinue}
                disabled={!canContinue}
              >
                {verifying
                  ? "Verifying payment…"
                  : paymentLoading
                    ? "Opening payment…"
                    : createOrder.isPending
                      ? "Creating order…"
                      : pendingPayment
                        ? paymentError
                          ? "Retry payment"
                          : "Complete payment"
                        : "Continue to payment"}
              </Button>

              {disabledReason ? (
                <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
                  {disabledReason}
                </p>
              ) : null}

              <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock aria-hidden="true" className="size-3.5 text-primary" />
                  No card details are stored by Rentify.
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                  Payments are handled by Razorpay.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-2">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">
              {formatDuration(selectedPlan.months)} · estimated total
            </p>
            <p className="truncate text-lg font-semibold tabular">
              {hasPricing ? formatINR(selectedPlan.total) : "—"}
            </p>
          </div>
          <Button
            type="button"
            variant="accent"
            onClick={handleContinue}
            disabled={!canContinue}
            className="shrink-0"
          >
            {verifying
              ? "Verifying…"
              : paymentLoading
                ? "Opening…"
                : createOrder.isPending
                  ? "Creating…"
                  : pendingPayment
                    ? "Pay now"
                    : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
