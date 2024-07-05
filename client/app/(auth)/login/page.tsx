import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginClient } from "@/components/auth/login-client";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Rentify account to manage saved rentals and orders.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4">
          <div className="w-full max-w-md space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-9 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="mt-8 h-11 w-full animate-pulse rounded-input bg-secondary" />
            <div className="h-11 w-full animate-pulse rounded-input bg-secondary" />
            <div className="h-11 w-full animate-pulse rounded-input bg-secondary" />
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
