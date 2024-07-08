"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { verifyPayment } from "@/lib/api/orders";
import { queryKeys } from "@/lib/api/query-keys";
import type { RazorpayPaymentResponse } from "@/types/razorpay";

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: RazorpayPaymentResponse;
    }) => verifyPayment(orderId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
    },
  });
}
