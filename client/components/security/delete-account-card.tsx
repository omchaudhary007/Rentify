"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

import { OtpChallenge } from "@/components/security/otp-challenge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDeleteAccount } from "@/hooks/mutations/use-security-mutations";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/providers/auth-provider";

const CONFIRMATION = "DELETE";

export function DeleteAccountCard() {
  const { user } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const reset = () => {
    setConfirmation("");
    setOtpVerified(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && deleteAccount.isPending) return;
    setOpen(next);
    if (!next) reset();
  };

  const handleDelete = () => {
    if (confirmation !== CONFIRMATION || !otpVerified || deleteAccount.isPending) return;
    setError(null);
    deleteAccount.mutate(undefined, {
      onError: (deleteError) => {
        const message = getApiErrorMessage(
          deleteError,
          "Could not delete your account. Please try again.",
        );
        if (/not verified/i.test(message)) setOtpVerified(false);
        setError(message);
      },
    });
  };

  return (
    <Card className="border-destructive/25 p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Trash2 aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Delete account</h2>
          <p className="text-xs text-muted-foreground">Permanent and irreversible</p>
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Deleting your account removes your profile and signs you out. This action cannot be
        undone.
      </p>

      <Button
        type="button"
        variant="destructive"
        className="mt-4"
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" />
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle aria-hidden="true" className="size-4 text-destructive" />
              Delete your account?
            </DialogTitle>
            <DialogDescription className="leading-6">
              This permanently removes your Rentify account. You will be signed out and cannot
              sign in again with these details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2.5 rounded-card border border-destructive/25 bg-destructive/5 p-3 text-sm">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-xs leading-5 text-muted-foreground">
              Account email: <span className="font-medium text-foreground">{user.email}</span>
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="delete-confirmation" className="block text-sm font-medium">
              Type <span className="font-mono font-semibold">{CONFIRMATION}</span> to confirm
            </label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError(null);
              }}
              autoComplete="off"
              placeholder={CONFIRMATION}
              disabled={deleteAccount.isPending}
            />
          </div>

          <div className="border-t border-border pt-4">
            <OtpChallenge
              email={user.email}
              verified={otpVerified}
              onVerified={() => setOtpVerified(true)}
              disabled={deleteAccount.isPending}
              sendLabel="Send deletion code"
              description="We send a code to your current email to confirm this request."
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={deleteAccount.isPending}
            >
              Keep account
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={
                confirmation !== CONFIRMATION || !otpVerified || deleteAccount.isPending
              }
            >
              <Trash2 aria-hidden="true" />
              {deleteAccount.isPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
