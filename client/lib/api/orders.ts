import type {
  AuthResponse,
  CreateOrderResponse,
  OrdersResponse,
  RenewOrderResponse,
  UndeliveredOrdersResponse,
} from "@/types/api";
import type { Order } from "@/types/order";

import { api } from "./client";

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<OrdersResponse>("/orders/myorder");
  return Array.isArray(data.orders) ? data.orders : [];
}

export async function getUndeliveredOrders(): Promise<Order[]> {
  const { data } = await api.get<UndeliveredOrdersResponse>("/orders/undelivered");
  return Array.isArray(data.pendingOrders) ? data.pendingOrders : [];
}

export async function createOrder(
  productId: string,
  duration: string,
): Promise<{ order: Order; paymentOrderId: string }> {
  const { data } = await api.post<CreateOrderResponse>(`/orders/${productId}`, { duration });
  return { order: data.order, paymentOrderId: data.paymentOrderId };
}

export async function verifyPayment(
  orderId: string,
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(`/orders/${orderId}/verify`, payload);
  return data;
}

export async function cancelOrder(orderId: string): Promise<AuthResponse> {
  const { data } = await api.patch<AuthResponse>(`/orders/${orderId}/cancel`);
  return data;
}

export async function renewOrder(
  orderId: string,
  duration: string,
): Promise<{ paymentOrderId: string; amount: number }> {
  const { data } = await api.patch<RenewOrderResponse>(`/orders/${orderId}/renew`, { duration });
  return { paymentOrderId: data.paymentOrderId, amount: data.amount };
}
