"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelOrder } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
  });
}
