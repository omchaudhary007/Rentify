import type { Metadata } from "next";
import { Suspense } from "react";

import { BrowseClient } from "@/components/products/browse-client";
import { ProductGridSkeleton } from "@/components/shared/skeletons";

export const metadata: Metadata = {
  title: "Browse rentals",
  description:
    "Browse furniture, electronics, and home essentials available to rent nearby. Filter by category, price, and monthly plan.",
};

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <BrowseClient />
    </Suspense>
  );
}
