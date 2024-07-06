import type { Order, OrderStatus } from "@/types/order";

export type OrderStatusVariant =
  | "info"
  | "warning"
  | "success"
  | "destructive"
  | "secondary";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; variant: OrderStatusVariant }
> = {
  confirmed: { label: "Confirmed", variant: "info" },
  shipped: { label: "Shipped", variant: "warning" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  returned: { label: "Returned", variant: "secondary" },
};

export function orderTotal(order: Pick<Order, "price" | "deliveryCharge">): number {
  return (order.price?.[0] ?? 0) + 2 * (order.deliveryCharge ?? 0);
}
