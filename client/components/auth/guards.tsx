"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardSkeleton } from "@/components/shared/skeletons";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/types/user";

function AuthLoading() {
  return (
    <div className="container-page py-10">
      <DashboardSkeleton />
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      const next = `${pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading) return <AuthLoading />;
  if (!user) return <AuthLoading />;
  return <>{children}</>;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const allowed = user ? roles.includes(user.role) : false;

  useEffect(() => {
    if (!isLoading && user && !allowed) {
      router.replace("/unauthorized");
    }
  }, [allowed, isLoading, router, user]);

  if (isLoading) return <AuthLoading />;
  if (!user) return null;
  if (!allowed) return <AuthLoading />;
  return <>{children}</>;
}
