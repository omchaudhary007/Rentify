import type { CloudinaryImage } from "./user";

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  productname: string;
  description: string;
  price: number;
  brand?: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  attributes: ProductAttribute[];
  subcategory: string;
  outofStock: boolean;
  images: CloudinaryImage[];
}
