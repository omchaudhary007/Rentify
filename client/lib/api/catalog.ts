import type {
  CategoriesResponse,
  CategoryResponse,
  CategorySubcategoriesResponse,
  CreateProductResponse,
  DeleteProductResponse,
  ProductResponse,
  ProductsResponse,
  SubcategoriesResponse,
  SubcategoryResponse,
  UpdateProductResponse,
} from "@/types/api";
import type { Category, Subcategory } from "@/types/category";
import type { Product, ProductAttribute } from "@/types/product";

import { api } from "./client";

export async function getCategories(pageSize = 100): Promise<Category[]> {
  const { data } = await api.get<CategoriesResponse>("/categories/all-categories", {
    params: { pagesize: pageSize },
  });
  return Array.isArray(data.Categories) ? data.Categories : [];
}

export async function getSubcategories(pageSize = 200): Promise<Subcategory[]> {
  const { data } = await api.get<SubcategoriesResponse>("/subcategories/all-subcategories", {
    params: { pagesize: pageSize },
  });
  return Array.isArray(data.subCategory) ? data.subCategory : [];
}

export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  const { data } = await api.get<CategorySubcategoriesResponse>(
    `/subcategories/${categoryId}`,
  );
  return Array.isArray(data.subcategories) ? data.subcategories : [];
}

export async function getProducts(params: {
  pageno: number;
  pageSize: number;
}): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>("/products/all-products", { params });
  return {
    ...data,
    products: Array.isArray(data.products) ? data.products : [],
    length: Number.isFinite(data.length) ? data.length : 0,
  };
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<ProductResponse>(`/products/${id}`);
  return data.product;
}

export interface CreateCategoryInput {
  categoryName: string;
  categoryImage: File;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const form = new FormData();
  form.append("categoryName", input.categoryName);
  form.append("categoryImage", input.categoryImage);
  const { data } = await api.post<CategoryResponse>("/categories/create", form);
  return data.category;
}

export interface UpdateCategoryInput {
  categoryName: string;
  newCategoryName?: string;
  categoryImage?: File;
}

export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const form = new FormData();
  form.append("categoryName", input.categoryName);
  if (input.newCategoryName) form.append("newCategoryName", input.newCategoryName);
  if (input.categoryImage) form.append("categoryImage", input.categoryImage);
  const { data } = await api.patch<CategoryResponse>("/categories/update", form);
  return data.category;
}

export interface SubcategoryInput {
  subcategory: string;
  newSubcategory?: string;
  category: string;
  monthPercent: number;
  threeMonthPercent: number;
  sixMonthPercent: number;
  oneYearPercent: number;
  twoYearPercent: number;
}

export async function createSubcategory(input: SubcategoryInput): Promise<Subcategory | undefined> {
  const { data } = await api.post<SubcategoryResponse>("/subcategories/create", input);
  return data.newSubcategory;
}

export async function updateSubcategory(input: SubcategoryInput): Promise<Subcategory | undefined> {
  const { data } = await api.post<SubcategoryResponse>("/subcategories/update", input);
  return data.Subcategory;
}

export interface CreateProductInput {
  productname: string;
  description: string;
  price: number;
  brand: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  subcategory: string;
  attributes: ProductAttribute[];
  images: File[];
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const form = new FormData();
  form.append("productname", input.productname);
  form.append("description", input.description);
  form.append("price", String(input.price));
  form.append("brand", input.brand);
  form.append("weight", String(input.weight));
  form.append("length", String(input.length));
  form.append("width", String(input.width));
  form.append("height", String(input.height));
  form.append("subcategory", input.subcategory);
  form.append("attributes", JSON.stringify(input.attributes));
  input.images.forEach((file) => form.append("productImage", file));
  const { data } = await api.post<CreateProductResponse>("/products/create", form);
  return data.newProduct;
}

export interface UpdateProductInput {
  id: string;
  productname?: string;
  description?: string;
  price?: number;
  brand?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  subcategory?: string;
  attributes?: ProductAttribute[];
  deleteImages?: number[];
  images?: File[];
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  const form = new FormData();
  const { id, images, deleteImages, attributes, ...fields } = input;

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  if (attributes) form.append("attributes", JSON.stringify(attributes));
  if (deleteImages && deleteImages.length > 0) {
    form.append("deleteImages", deleteImages.join(","));
  }
  images?.forEach((file) => form.append("productImage", file));

  const { data } = await api.patch<UpdateProductResponse>(`/products/update/${id}`, form);
  return data.updatedProduct;
}

export async function deleteProduct(id: string): Promise<Product> {
  const { data } = await api.delete<DeleteProductResponse>(`/products/delete/${id}`);
  return data.deletedProduct;
}
