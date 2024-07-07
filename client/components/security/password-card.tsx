"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { OtpChallenge } from "@/components/security/otp-challenge";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdatePassword } from "@/hooks/mutations/use-security-mutations";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const passwordSchema = z
  .object({
    oldpassword: z.string().min(1, "Enter your current password."),
    newpassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newpassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function PasswordCard() {
  const { user } = useAuth();
  const updatePassword = useUpdatePassword();
  const [otpVerified, setOtpVerified] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldpassword: "", newpassword: "", confirmPassword: "" },
  });

  if (!user) return null;

  const onSubmit = (values: PasswordValues) => {
    setFormError(null);
    updatePassword.mutate(
      { oldpassword: values.oldpassword, newpassword: values.newpassword },
      {
        onSuccess: () => {
          form.reset();
          setOtpVerified(false);
        },
        onError: (error) => {
          const message = getApiErrorMessage(
            error,
            "Could not change your password. Please try again.",
          );
          if (/not verified/i.test(message)) setOtpVerified(false);
          setFormError(message);
        },
      },
    );
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
          <KeyRound aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Change password</h2>
          <p className="text-xs text-muted-foreground">Verify your email first</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        For security, we send a code to your current email. After verifying it, enter your old
        password and choose a new one.
      </p>

      <div className="mt-4">
        <OtpChallenge
          email={user.email}
          verified={otpVerified}
          onVerified={() => setOtpVerified(true)}
          disabled={updatePassword.isPending}
          sendLabel="Send code to current email"
          description="The code goes to the email currently on your account."
        />
      </div>

      {otpVerified ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4 border-t border-border pt-5">
            <FormField
              control={form.control}
              name="oldpassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="current-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newpassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError ? (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={updatePassword.isPending}>
              {updatePassword.isPending ? "Updating…" : "Change password"}
            </Button>
          </form>
        </Form>
      ) : null}
    </Card>
  );
}
