export type OrderStatus =
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Order {
  _id: string;
  user: string;
  product: string;
  productPincode: string;
  price: number[];
  deliveryCharge: number;
  duration: number[];
  orderStatus: OrderStatus;
  paymentOrderId: string[];
  isPaid: boolean;
  isRefunded: boolean;
  confirmationDate?: string;
  shippingDate?: string;
  deliveryDate?: string;
  cancelDate?: string;
  returnDate?: string;
  rentPlanEndDate?: string;
  createdAt: string;
  updatedAt: string;
}
