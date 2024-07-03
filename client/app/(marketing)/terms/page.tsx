import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that apply when you rent or list products on Rentify.",
};

export default function TermsPage() {
  return (
    <div className="container-page section-space">
      <div className="mx-auto max-w-[68ch]">
        <p className="text-caption text-primary">Legal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">Terms of use</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Rentify connects people who own products with people who want to rent them. Listings
            must describe the product accurately, including its condition and dimensions.
          </p>
          <p>
            Rental plans run for 1, 3, 6, 12, or 24 months. Delivery and return pickup are included
            in the final quote shown at checkout.
          </p>
          <p>
            Questions about these terms can be sent to{" "}
            <a className="text-primary underline underline-offset-4" href="mailto:hello@rentify.example">
              hello@rentify.example
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
