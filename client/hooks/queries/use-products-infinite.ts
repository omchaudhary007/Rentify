"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getProducts } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/api/query-keys";

export function useInfiniteProducts(pageSize = 12) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.infinite(pageSize),
    queryFn: ({ pageParam }) => getProducts({ pageno: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length !== pageSize) return undefined;
      return allPages.length + 1;
    },
    staleTime: 30_000,
  });
}
