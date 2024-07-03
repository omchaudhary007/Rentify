"use client";

import { useQuery } from "@tanstack/react-query";

import { getCart, type CartItems } from "@/lib/api/cart";
import { queryKeys } from "@/lib/api/query-keys";

export function useCart(enabled: boolean) {
  return useQuery<CartItems>({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}
