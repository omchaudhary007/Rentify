"use client";

import { ArrowLeft, Compass, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { roleHome } from "@/lib/navigation";
import { useAuth } from "@/providers/auth-provider";

export function UnauthorizedClient() {
  const { user } = useAuth();

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-panel border border-border bg-card p-6 text-center sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <LockKeyhole aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </div>
        <p className="mt-6 text-caption text-primary">Access denied</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
          You don’t have access to this page
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          This area is for a different account role. Your dashboard has the pages available to
          you.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          {user ? (
            <Button asChild>
              <Link href={roleHome(user.role)}>
                Go to my dashboard
                <Compass aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/products">
              <ArrowLeft aria-hidden="true" />
              Browse rentals
            </Link>
          </Button>
        </div>

        {user ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Signed in as {user.name} · {user.role === "deliveryman" ? "Delivery partner" : user.role}
          </p>
        ) : null}
      </div>
    </div>
  );
}
