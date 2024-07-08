export const queryKeys = {
  me: ["me"] as const,
  products: {
    all: ["products"] as const,
    list: (page: number, pageSize: number) => ["products", "list", page, pageSize] as const,
    infinite: (pageSize: number) => ["products", "list", "infinite", pageSize] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  subcategories: {
    all: ["subcategories"] as const,
    byCategory: (categoryId: string) => ["subcategories", "category", categoryId] as const,
  },
  cart: ["cart"] as const,
  orders: {
    mine: ["orders", "mine"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
    undelivered: ["orders", "undelivered"] as const,
  },
};
