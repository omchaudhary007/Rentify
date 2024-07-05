"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthAside } from "@/components/auth/auth-aside";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/mutations/use-login";
import { getApiErrorMessage, getApiStatus } from "@/lib/api/errors";
import { resolveAuthRedirect } from "@/lib/navigation";
import { useAuth } from "@/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

function loginErrorMessage(error: unknown): string {
  const status = getApiStatus(error);
  if (status === 400 || status === 401 || status === 404) {
    return "Email or password is incorrect.";
  }
  return getApiErrorMessage(error, "Could not sign you in. Please try again.");
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetNote, setShowResetNote] = useState(false);
  const passwordId = useId();

  const next = searchParams.get("next");
  const emailParam = searchParams.get("email") ?? "";
  const justRegistered = searchParams.get("registered") === "1";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: emailParam, password: "" },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(resolveAuthRedirect(next, user.role));
    }
  }, [authLoading, next, router, user]);

  useEffect(() => {
    if (emailParam) {
      form.setValue("email", emailParam, { shouldValidate: false });
    }
  }, [emailParam, form]);

  const onSubmit = (values: LoginValues) => {
    setFormError(null);
    loginMutation.mutate(values, {
      onSuccess: ({ user: signedInUser }) => {
        router.replace(resolveAuthRedirect(next, signedInUser.role));
      },
      onError: (error) => {
        setFormError(loginErrorMessage(error));
      },
    });
  };

  if (authLoading) {
    return (
      <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-9 w-2/3 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            <div className="mt-8 h-11 w-full animate-pulse rounded-input bg-secondary" />
            <div className="h-11 w-full animate-pulse rounded-input bg-secondary" />
            <div className="h-11 w-full animate-pulse rounded-input bg-secondary" />
          </div>
        </div>
        <AuthAside />
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <p className="text-caption text-primary">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Sign in to Rentify
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Pick up where you left off with your saved rentals and orders.
          </p>

          {justRegistered ? (
            <div
              role="status"
              className="mt-6 flex gap-2.5 rounded-card border border-success/25 bg-success/8 p-3 text-sm text-success"
            >
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>Account created. Sign in to continue.</p>
            </div>
          ) : null}

          {formError ? (
            <div
              role="alert"
              className="mt-6 rounded-card border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {formError}
            </div>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={loginMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>Password</FormLabel>
                      <button
                        type="button"
                        onClick={() => setShowResetNote((current) => !current)}
                        aria-expanded={showResetNote}
                        aria-controls={`${passwordId}-reset-note`}
                        className="rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Your password"
                          className="pr-11"
                          disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden="true" className="size-4" />
                        ) : (
                          <Eye aria-hidden="true" className="size-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                    {showResetNote ? (
                      <p
                        id={`${passwordId}-reset-note`}
                        className="rounded-input border border-border bg-secondary/50 px-3 py-2 text-xs leading-5 text-muted-foreground"
                      >
                        Password reset isn’t available yet. Contact support at{" "}
                        <a
                          href="mailto:hello@rentify.example"
                          className="text-primary underline underline-offset-4"
                        >
                          hello@rentify.example
                        </a>
                        .
                      </p>
                    ) : null}
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Rentify?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
            Your session is stored in a secure, HttpOnly cookie.
          </p>
        </div>
      </div>

      <AuthAside />
    </div>
  );
}
