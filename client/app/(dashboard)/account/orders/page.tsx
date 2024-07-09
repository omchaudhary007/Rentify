import type { Metadata } from "next";

import { OrdersList } from "@/components/orders/orders-list";

export const metadata: Metadata = {
  title: "Orders",
  description: "Track your Rentify rentals, payments, and deliveries.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersList />;
}
