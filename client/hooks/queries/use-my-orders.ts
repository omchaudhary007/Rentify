"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyOrders } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: queryKeys.orders.mine,
    queryFn: getMyOrders,
    enabled,
    staleTime: 30_000,
  });
}
