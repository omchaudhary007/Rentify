import type { Metadata } from "next";

import { UnauthorizedClient } from "@/components/auth/unauthorized-client";

export const metadata: Metadata = {
  title: "Access denied",
  description: "This page is not available for your account role.",
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return <UnauthorizedClient />;
}
