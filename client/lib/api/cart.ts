import type { CartResponse } from "@/types/api";
import type { Product } from "@/types/product";

import { api } from "./client";

export interface CartItems {
  itemCount: number;
  cart: string[];
  cartItems: Product[];
}

export async function getCart(): Promise<CartItems> {
  const { data } = await api.get<CartResponse>("/carts/items");
  return {
    itemCount: data.itemCount ?? data.cartItems?.length ?? 0,
    cart: Array.isArray(data.cart) ? data.cart : [],
    cartItems: Array.isArray(data.cartItems) ? data.cartItems : [],
  };
}

export async function addToCart(productId: string): Promise<CartResponse> {
  const { data } = await api.get<CartResponse>(`/carts/add/${productId}`);
  return data;
}

export async function removeFromCart(productId: string): Promise<CartResponse> {
  const { data } = await api.get<CartResponse>(`/carts/remove/${productId}`);
  return data;
}

export async function clearCart(): Promise<CartResponse> {
  const { data } = await api.get<CartResponse>("/carts/clear");
  return data;
}
