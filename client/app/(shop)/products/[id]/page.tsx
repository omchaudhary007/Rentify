import type { Metadata } from "next";

import { ProductDetail } from "@/components/products/product-detail";
import { getProduct } from "@/lib/api/catalog";
import type { Product } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const META_TIMEOUT_MS = 2_500;

async function getProductForMetadata(id: string): Promise<Product | null> {
  try {
    return await Promise.race([
      getProduct(id),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), META_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForMetadata(id);

  if (!product) {
    return {
      title: "Rent on Rentify",
      description: "Browse furniture, electronics, and home essentials available to rent.",
    };
  }

  const description =
    product.description.length > 155
      ? `${product.description.slice(0, 152).trimEnd()}…`
      : product.description;
  const image = product.images?.[0]?.url;

  return {
    title: `Rent ${product.productname}`,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: `Rent ${product.productname} on Rentify`,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.productname }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetail key={id} id={id} />;
}
