import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterClient } from "@/components/auth/register-client";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Rentify account to rent furniture, electronics, and home essentials.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-12">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
            <div className="h-9 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-2 w-full animate-pulse rounded-pill bg-secondary" />
            <div className="h-96 rounded-panel bg-secondary" />
          </div>
        </div>
      }
    >
      <RegisterClient />
    </Suspense>
  );
}
