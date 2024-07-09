"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { renewOrder } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";
import type { RentalPlanKey } from "@/lib/pricing";

export function useRenewOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, planKey }: { orderId: string; planKey: RentalPlanKey }) =>
      renewOrder(orderId, planKey),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
    },
  });
}
