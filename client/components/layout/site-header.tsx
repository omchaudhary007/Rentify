"use client";

import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/queries/use-cart";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

import { Logo } from "../shared/logo";
import { ThemeToggle } from "../shared/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { label: "Browse", href: "/products" },
  { label: "Categories", href: "/#categories" },
  { label: "How it works", href: "/#how-it-works" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const cartQuery = useCart(user?.role === "user");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const solid = isScrolled || !isHome;
  const cartCount = cartQuery.data?.itemCount ?? 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200",
        solid
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[72px]">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/products"
                ? pathname === "/products" || pathname.startsWith("/products/")
                : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-input px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user?.role === "user" ? (
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart" aria-label={`Cart, ${cartCount} items`}>
                <ShoppingBag aria-hidden="true" />
                {cartCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                ) : null}
              </Link>
            </Button>
          ) : null}

          {isLoading ? (
            <Skeleton className="ml-1 hidden h-9 w-24 rounded-input sm:block" />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/login?next=/listings/new">List a product</Link>
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
        </div>
      </div>

      <MobileNav
        open={menuOpen}
        onOpenChange={setMenuOpen}
        user={user}
        cartCount={cartCount}
      />
    </header>
  );
}
