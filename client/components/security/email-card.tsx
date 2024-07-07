"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { OtpChallenge } from "@/components/security/otp-challenge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateEmail } from "@/hooks/mutations/use-security-mutations";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const emailSchema = z.string().email();

export function EmailCard() {
  const { user } = useAuth();
  const updateEmail = useUpdateEmail();
  const [newEmail, setNewEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user) return null;

  const normalized = newEmail.trim().toLowerCase();
  const currentEmail = user.email.toLowerCase();
  const validEmail = emailSchema.safeParse(normalized).success;
  const isSameEmail = normalized === currentEmail;
  const canSend = validEmail && !isSameEmail;
  const isVerified = Boolean(normalized) && verifiedEmail === normalized;

  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    setSaveError(null);
    if (verifiedEmail && value.trim().toLowerCase() !== verifiedEmail) {
      setVerifiedEmail(null);
    }
  };

  const handleSave = () => {
    if (!isVerified) return;
    setSaveError(null);
    updateEmail.mutate(normalized, {
      onSuccess: () => {
        setNewEmail("");
        setVerifiedEmail(null);
      },
      onError: (error) => {
        const message = getApiErrorMessage(
          error,
          "Could not update your email. Please try again.",
        );
        if (/not verified/i.test(message)) setVerifiedEmail(null);
        setSaveError(message);
      },
    });
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
          <Mail aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Change email</h2>
          <p className="text-xs text-muted-foreground">Current: {user.email}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Enter a new address and verify the code sent to it. Your sign-in email changes only after
        the code is accepted.
      </p>

      <div className="mt-4 space-y-3">
        <label htmlFor="new-email" className="block text-sm font-medium">
          New email
        </label>
        <Input
          id="new-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={newEmail}
          onChange={(event) => handleEmailChange(event.target.value)}
          placeholder="new@example.com"
          aria-invalid={Boolean(normalized) && (!validEmail || isSameEmail)}
        />
        {normalized && !validEmail ? (
          <p className="text-sm text-destructive">Enter a valid email address.</p>
        ) : null}
        {normalized && isSameEmail ? (
          <p className="text-sm text-muted-foreground">This is already your email address.</p>
        ) : null}
      </div>

      {canSend ? (
        <div className="mt-5 border-t border-border pt-5">
          <OtpChallenge
            email={normalized}
            verified={isVerified}
            onVerified={() => setVerifiedEmail(normalized)}
            disabled={updateEmail.isPending}
            sendLabel="Send code to new email"
            description="The code goes to your new address, not your current one."
          />
        </div>
      ) : null}

      {saveError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {saveError}
        </p>
      ) : null}

      {isVerified ? (
        <Button
          type="button"
          className="mt-5 w-full"
          onClick={handleSave}
          disabled={updateEmail.isPending}
        >
          {updateEmail.isPending ? "Saving…" : "Save new email"}
        </Button>
      ) : null}
    </Card>
  );
}
