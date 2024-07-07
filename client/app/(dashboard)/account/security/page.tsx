import type { Metadata } from "next";

import { SecurityClient } from "@/components/security/security-client";

export const metadata: Metadata = {
  title: "Security",
  description: "Change your Rentify email or password, or delete your account.",
  robots: { index: false, follow: false },
};

export default function SecurityPage() {
  return <SecurityClient />;
}
