import Link from "next/link";

import { Logo } from "../shared/logo";

const MARKETPLACE_LINKS = [
  { label: "Browse rentals", href: "/products" },
  { label: "Categories", href: "/#categories" },
  { label: "List a product", href: "/listings/new" },
];

const ACCOUNT_LINKS = [
  { label: "Log in", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Orders", href: "/account/orders" },
  { label: "Cart", href: "/cart" },
];

const SUPPORT_LINKS = [
  { label: "hello@rentify.example", href: "mailto:hello@rentify.example" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Delivery", href: "/delivery" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-caption text-muted-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => {
          const external = link.href.startsWith("mailto:");
          return (
            <li key={link.href}>
              {external ? (
                <a
                  href={link.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/35">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo showTagline />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Furniture, electronics, and home essentials from people nearby — on plans that fit
              your life.
            </p>
          </div>
          <FooterColumn title="Marketplace" links={MARKETPLACE_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
          <FooterColumn title="Support" links={SUPPORT_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 Rentify. Rent better. Own less.</p>
          <p>Secure payments · Doorstep delivery · Flexible plans</p>
        </div>
      </div>
    </footer>
  );
}
