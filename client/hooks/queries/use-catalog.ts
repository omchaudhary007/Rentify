"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategories, getProduct, getProducts, getSubcategories } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/api/query-keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => getCategories(100),
    staleTime: 5 * 60_000,
  });
}

export function useSubcategories() {
  return useQuery({
    queryKey: queryKeys.subcategories.all,
    queryFn: () => getSubcategories(200),
    staleTime: 5 * 60_000,
  });
}

export function useProductPage(page: number, pageSize: number) {
  return useQuery({
    queryKey: queryKeys.products.list(page, pageSize),
    queryFn: () => getProducts({ pageno: page, pageSize }),
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    staleTime: 60_000,
  });
}
