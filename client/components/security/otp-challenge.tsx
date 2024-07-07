"use client";

import { CheckCircle2, Mail } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { requestOtp, verifyOtp } from "@/lib/api/otp";
import { formatCountdown } from "@/lib/format";

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 125;

export function OtpChallenge({
  email,
  verified,
  onVerified,
  disabled = false,
  sendLabel = "Send code",
  description,
}: {
  email: string;
  verified: boolean;
  onVerified: () => void;
  disabled?: boolean;
  sendLabel?: string;
  description?: string;
}) {
  const inputId = useId();
  const [sentFor, setSentFor] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const active = sentFor === email;
  const activeCountdown = active ? countdown : 0;

  useEffect(() => {
    if (countdown <= 0) return;
    const timeout = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [countdown]);

  const sendCode = () => {
    if (!email || sending || disabled) return;
    setSending(true);
    setError(null);
    requestOtp(email)
      .then((response) => {
        setSentFor(email);
        setCode("");
        setCountdown(OTP_RESEND_SECONDS);
        toast.success(response.message || "Verification code sent.");
      })
      .catch((requestError: unknown) => {
        setError(
          getApiErrorMessage(requestError, "Could not send the code. Please try again."),
        );
      })
      .finally(() => setSending(false));
  };

  const handleVerify = () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (verifying || disabled) return;

    setVerifying(true);
    setError(null);
    verifyOtp(email, code)
      .then(() => {
        onVerified();
        setCode("");
        toast.success("Email verified.");
      })
      .catch((verifyError: unknown) => {
        setError(
          getApiErrorMessage(
            verifyError,
            "That code is invalid or has expired. Request a new code.",
          ),
        );
      })
      .finally(() => setVerifying(false));
  };

  if (verified) {
    return (
      <div
        role="status"
        className="flex gap-2.5 rounded-card border border-success/25 bg-success/8 p-3 text-sm text-success"
      >
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Email verified</p>
          <p className="mt-0.5 text-xs leading-5 text-success/80">
            The code was accepted for {email}.
          </p>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="space-y-3">
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={sendCode} disabled={sending || disabled}>
            <Mail aria-hidden="true" />
            {sending ? "Sending…" : sendLabel}
          </Button>
          <span className="text-xs text-muted-foreground">A 6-digit code will be emailed.</span>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-card border border-border bg-secondary/45 p-3">
        <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-medium">Code sent</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <label htmlFor={inputId} className="block text-sm font-medium">
        Verification code
      </label>
      <Input
        id={inputId}
        value={code}
        onChange={(event) => {
          setCode(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
          setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleVerify();
          }
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={OTP_LENGTH}
        placeholder="000000"
        aria-invalid={Boolean(error)}
        className="text-center font-mono text-lg tracking-[0.45em]"
        disabled={disabled || verifying}
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleVerify}
          disabled={disabled || verifying || code.length < OTP_LENGTH}
        >
          {verifying ? "Verifying…" : "Verify code"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={sendCode}
          disabled={disabled || sending || verifying || activeCountdown > 0}
        >
          {sending
            ? "Sending…"
            : activeCountdown > 0
              ? `Resend in ${formatCountdown(activeCountdown)}`
              : "Resend code"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">The code expires after about 2 minutes.</p>
    </div>
  );
}
