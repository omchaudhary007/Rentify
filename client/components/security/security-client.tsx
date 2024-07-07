"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DeleteAccountCard } from "@/components/security/delete-account-card";
import { EmailCard } from "@/components/security/email-card";
import { PasswordCard } from "@/components/security/password-card";

export function SecurityClient() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Security"
        description="Manage the email and password you use to sign in, or delete your account."
      />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <EmailCard />
        <PasswordCard />
      </div>

      <DeleteAccountCard />
    </div>
  );
}
