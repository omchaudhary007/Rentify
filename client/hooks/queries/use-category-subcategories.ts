"use client";

import { useQuery } from "@tanstack/react-query";

import { getSubcategoriesByCategory } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/api/query-keys";

export function useCategorySubcategories(categoryId: string | null) {
  return useQuery({
    queryKey: queryKeys.subcategories.byCategory(categoryId ?? ""),
    queryFn: () => getSubcategoriesByCategory(categoryId ?? ""),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60_000,
  });
}
