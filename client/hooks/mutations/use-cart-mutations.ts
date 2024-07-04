"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addToCart, clearCart, removeFromCart } from "@/lib/api/cart";
import { getApiErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addToCart(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success(data.message || "Added to your cart.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add this rental to your cart."));
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeFromCart(productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success(data.message || "Removed from your cart.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not remove this rental from your cart."));
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success(data.message || "Cart cleared.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not clear your cart."));
    },
  });
}
