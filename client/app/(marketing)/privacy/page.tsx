import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Rentify handles your account and rental information.",
};

export default function PrivacyPage() {
  return (
    <div className="container-page section-space">
      <div className="mx-auto max-w-[68ch]">
        <p className="text-caption text-primary">Legal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em]">Privacy</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Rentify stores the details you provide when you create an account so we can process
            rentals, deliver products, and keep you informed about your orders.
          </p>
          <p>
            Your session is kept in a secure, HttpOnly cookie. We do not store payment card details
            on Rentify; payments are handled by Razorpay.
          </p>
          <p>
            For privacy requests, contact{" "}
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
