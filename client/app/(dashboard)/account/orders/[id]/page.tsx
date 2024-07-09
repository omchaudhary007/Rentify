import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderDetailClient } from "@/components/orders/order-detail-client";
import { DashboardSkeleton } from "@/components/shared/skeletons";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order details",
  description: "View your Rentify order, payment state, and delivery timeline.",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OrderDetailClient orderId={id} />
    </Suspense>
  );
}
