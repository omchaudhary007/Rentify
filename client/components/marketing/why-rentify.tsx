import { BadgeCheck, Lock, RefreshCw, Truck } from "lucide-react";

const TILES = [
  {
    icon: RefreshCw,
    title: "Flexible plans",
    body: "Rent for a month or two years. Every plan shows the full total and effective monthly cost, so there are no surprises.",
    className: "md:col-span-2 md:row-span-2 bg-card",
    featured: true,
  },
  {
    icon: Truck,
    title: "Doorstep delivery",
    body: "Delivery and return pickup are included in the final quote, calculated from the product's size and weight.",
    className: "bg-secondary/60",
  },
  {
    icon: BadgeCheck,
    title: "Verified listings",
    body: "Products are listed with real details, photos, and dimensions before they reach you.",
    className: "bg-card",
  },
  {
    icon: Lock,
    title: "Secure payments",
    body: "Payments are handled by Razorpay. Your session stays in a secure HttpOnly cookie.",
    className: "bg-secondary/60",
  },
];

export function WhyRentify() {
  return (
    <section className="container-page section-space">
      <div className="max-w-2xl">
        <p className="text-caption text-primary">Why Rentify</p>
        <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
          Renting that feels
          <span className="font-display font-normal text-primary"> considered.</span>
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          A marketplace built around clear pricing, careful delivery, and products worth keeping
          around for a while.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.title}
              className={`rounded-panel border border-border p-6 ${tile.className}`}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em]">{tile.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{tile.body}</p>
              {tile.featured ? (
                <div className="mt-8 rounded-card border border-border bg-background p-4">
                  <p className="text-caption text-muted-foreground">A typical plan</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-sm font-medium">6-month rental</p>
                    <span className="rounded-pill bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      Total upfront
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    The rent percentage comes from the product&apos;s category, so longer plans cost
                    less per month.
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
