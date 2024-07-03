import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="container-page pb-16 md:pb-24">
      <div className="relative overflow-hidden rounded-panel bg-primary px-6 py-12 text-primary-foreground sm:px-10 md:px-14 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full border border-primary-foreground/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-24 size-56 rounded-full border border-primary-foreground/10"
        />
        <div className="relative max-w-2xl">
          <p className="text-caption text-primary-foreground/70">Ready when you are</p>
          <h2 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] sm:text-4xl md:text-5xl">
            Rent better.
            <br />
            <span className="font-display font-normal text-accent">Own less.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-primary-foreground/75 sm:text-base">
            Find the thing you need for the season, the move, or the project — then send it back
            when you are done.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <Link href="/products">
                Browse rentals
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/login?next=/listings/new">List your product</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
