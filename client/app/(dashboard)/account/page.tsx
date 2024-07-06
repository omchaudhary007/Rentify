import type { Metadata } from "next";

import { AccountOverview } from "@/components/dashboard/account-overview";

export const metadata: Metadata = {
  title: "Account overview",
  description: "Your Rentify rentals, orders, and account details.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountOverview />;
}
