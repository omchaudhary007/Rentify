import type { Category, Subcategory } from "./category";
import type { Order } from "./order";
import type { Product } from "./product";
import type { User } from "./user";

export interface ApiEnvelope {
  success: boolean;
  message: string;
}

export type AuthResponse = ApiEnvelope;
export interface ProfileResponse extends ApiEnvelope {
  user: User;
}
export interface ProductsResponse extends ApiEnvelope {
  length: number;
  products: Product[];
}
export interface ProductResponse extends ApiEnvelope {
  product: Product;
}
export interface CategoriesResponse extends ApiEnvelope {
  Categories: Category[];
}
export interface SubcategoriesResponse extends ApiEnvelope {
  subCategory: Subcategory[];
}
export interface CategorySubcategoriesResponse extends ApiEnvelope {
  size: number;
  subcategories: Subcategory[];
}
export interface CartResponse extends ApiEnvelope {
  itemCount?: number;
  cart?: string[];
  cartItems?: Product[];
}
export interface OrdersResponse extends ApiEnvelope {
  orderCount: number;
  orders: Order[];
}
export interface UndeliveredOrdersResponse extends ApiEnvelope {
  count: number;
  pendingOrders: Order[];
}
export interface CreateOrderResponse extends ApiEnvelope {
  order: Order;
  paymentOrderId: string;
}
export interface RenewOrderResponse extends ApiEnvelope {
  paymentOrderId: string;
  amount: number;
}
export interface CategoryResponse extends ApiEnvelope {
  category: Category;
}
export interface SubcategoryResponse extends ApiEnvelope {
  newSubcategory?: Subcategory;
  Subcategory?: Subcategory;
}
export interface CreateProductResponse extends ApiEnvelope {
  newProduct: Product;
}
export interface UpdateProductResponse extends ApiEnvelope {
  updatedProduct: Product;
}
export interface DeleteProductResponse extends ApiEnvelope {
  deletedProduct: Product;
}
