"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createOrder } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";
import type { RentalPlanKey } from "@/lib/pricing";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      planKey,
    }: {
      productId: string;
      planKey: RentalPlanKey;
    }) => createOrder(productId, planKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.mine });
    },
  });
}
