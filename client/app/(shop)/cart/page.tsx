import type { Metadata } from "next";

import { CartClient } from "@/components/cart/cart-client";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review rentals you have saved and choose a plan to check out.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartClient />;
}
