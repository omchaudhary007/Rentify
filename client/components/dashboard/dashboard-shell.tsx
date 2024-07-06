"use client";

import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/mutations/use-logout";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/types/user";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  user: "Renter",
  deliveryman: "Delivery partner",
  admin: "Admin",
};

function navItems(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
      { label: "Subcategories", href: "/admin/subcategories", icon: Percent },
      { label: "Profile", href: "/account/profile", icon: UserRound },
      { label: "Security", href: "/account/security", icon: ShieldCheck },
    ];
  }

  if (role === "deliveryman") {
    return [
      { label: "Delivery queue", href: "/delivery", icon: Truck },
      { label: "Profile", href: "/account/profile", icon: UserRound },
      { label: "Security", href: "/account/security", icon: ShieldCheck },
    ];
  }

  return [
    { label: "Overview", href: "/account", icon: LayoutDashboard, exact: true },
    { label: "Profile", href: "/account/profile", icon: UserRound },
    { label: "Security", href: "/account/security", icon: ShieldCheck },
    { label: "Orders", href: "/account/orders", icon: Package },
    { label: "My listings", href: "/account/listings", icon: ShoppingBag },
    { label: "Cart", href: "/cart", icon: ShoppingBag },
  ];
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  const items = navItems(user.role);
  const roleLabel = ROLE_LABEL[user.role];

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card/45 lg:flex">
          <div className="px-5 pb-5 pt-6">
            <Logo showTagline />
            <div className="mt-6 flex items-center gap-3 rounded-card border border-border bg-card p-3">
              <Avatar className="size-9">
                <AvatarImage src={user.profilePic?.url ?? undefined} alt="" />
                <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge
              variant={user.role === "admin" ? "default" : user.role === "deliveryman" ? "warning" : "secondary"}
              className="mt-3"
            >
              {roleLabel}
            </Badge>
          </div>

          <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-input px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <item.icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-3">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                type="button"
                variant="ghost"
                className="flex-1 justify-start text-muted-foreground"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                <LogOut aria-hidden="true" />
                {logout.isPending ? "Signing out…" : "Sign out"}
              </Button>
            </div>
            <Link
              href="/products"
              className="mt-1 block rounded-input px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ← Back to rentals
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl lg:hidden">
            <div className="flex h-16 items-center justify-between gap-3 px-4">
              <Logo />
              <div className="flex items-center gap-1">
                <Badge
                  variant={user.role === "admin" ? "default" : user.role === "deliveryman" ? "warning" : "secondary"}
                >
                  {roleLabel}
                </Badge>
                <ThemeToggle />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  <LogOut aria-hidden="true" />
                </Button>
              </div>
            </div>

            <nav aria-label="Dashboard" className="no-scrollbar overflow-x-auto border-t border-border">
              <ul className="flex min-w-max gap-1 px-3 py-1.5">
                {items.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-1.5 rounded-input px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        <item.icon aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </header>

          <main id="main" className="min-h-[calc(100dvh-4rem)]">
            <div className="container-page py-6 md:py-8 lg:py-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
