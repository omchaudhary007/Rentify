import type { Metadata } from "next";

import { CategoryMarquee } from "@/components/marketing/category-marquee";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { FeaturedProducts } from "@/components/marketing/featured-products";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ListerCta } from "@/components/marketing/lister-cta";
import { WhyRentify } from "@/components/marketing/why-rentify";

export const metadata: Metadata = {
  title: "Rentify — Rent furniture, electronics and more",
  description:
    "Furniture, electronics, and home essentials from people nearby — on flexible 1 to 24 month plans. Rent better. Own less.",
  openGraph: {
    title: "Rentify — Rent furniture, electronics and more",
    description:
      "Furniture, electronics, and home essentials from people nearby — on flexible 1 to 24 month plans.",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <CategoryMarquee />
      <FeaturedProducts />
      <HowItWorks />
      <WhyRentify />
      <ListerCta />
      <ClosingCta />
    </>
  );
}
