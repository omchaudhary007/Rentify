"use client";

import { ArrowRight, LogIn, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLogout } from "@/hooks/mutations/use-logout";
import type { User } from "@/types/user";

import { ThemeToggle } from "../shared/theme-toggle";

const GUEST_LINKS = [
  { label: "Browse rentals", href: "/products" },
  { label: "Categories", href: "/#categories" },
  { label: "How it works", href: "/#how-it-works" },
];

function accountLinks(user: User) {
  if (user.role === "admin") {
    return [
      { label: "Overview", href: "/account" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Subcategories", href: "/admin/subcategories" },
      { label: "Profile", href: "/account/profile" },
      { label: "Security", href: "/account/security" },
    ];
  }
  if (user.role === "deliveryman") {
    return [
      { label: "Delivery queue", href: "/delivery" },
      { label: "Profile", href: "/account/profile" },
      { label: "Security", href: "/account/security" },
    ];
  }
  return [
    { label: "My account", href: "/account" },
    { label: "Orders", href: "/account/orders" },
    { label: "My listings", href: "/account/listings" },
    { label: "Profile", href: "/account/profile" },
    { label: "Security", href: "/account/security" },
  ];
}

export function MobileNav({
  open,
  onOpenChange,
  user,
  cartCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  cartCount: number;
}) {
  const logout = useLogout();
  const close = () => onOpenChange(false);
  const links = user ? accountLinks(user) : GUEST_LINKS;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-lg">Menu</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {user ? `Signed in as ${user.name}` : "Rent better. Own less."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-[calc(100dvh-92px)] flex-col overflow-y-auto px-4 py-4">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-center justify-between rounded-input px-3 py-3.5 text-base font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
                <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
              </Link>
            ))}
            {user?.role === "user" ? (
              <Link
                href="/cart"
                onClick={close}
                className="flex items-center justify-between rounded-input px-3 py-3.5 text-base font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag aria-hidden="true" className="size-4" />
                  Cart
                </span>
                <span className="text-sm text-muted-foreground">{cartCount} items</span>
              </Link>
            ) : null}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            {user ? (
              <>
                {user.role === "user" ? (
                  <Button asChild className="w-full">
                    <Link href="/listings/new" onClick={close}>
                      List a product
                    </Link>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={logout.isPending}
                  onClick={() => {
                    close();
                    logout.mutate();
                  }}
                >
                  {logout.isPending ? "Signing out…" : "Sign out"}
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={close}>
                    <LogIn aria-hidden="true" />
                    Log in
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/login?next=/listings/new" onClick={close}>
                    List a product
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
