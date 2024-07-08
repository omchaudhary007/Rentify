import type { Metadata } from "next";
import { Suspense } from "react";

import { RequireRole } from "@/components/auth/guards";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { DetailSkeleton } from "@/components/shared/skeletons";

interface CheckoutPageProps {
  params: Promise<{ productId: string }>;
}

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your rental plan, delivery address, and estimated total.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productId } = await params;

  return (
    <RequireRole roles={["user"]}>
      <Suspense
        fallback={
          <div className="container-page py-8 md:py-12">
            <DetailSkeleton />
          </div>
        }
      >
        <CheckoutClient productId={productId} />
      </Suspense>
    </RequireRole>
  );
}
