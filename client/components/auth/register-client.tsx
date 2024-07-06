"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Mail,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { RegisterStepper } from "@/components/auth/register-stepper";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRegister } from "@/hooks/mutations/use-register";
import { getApiErrorMessage } from "@/lib/api/errors";
import { requestOtp, verifyOtp } from "@/lib/api/otp";
import { cn } from "@/lib/utils";
import { resolveAuthRedirect } from "@/lib/navigation";
import { useAuth } from "@/providers/auth-provider";

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 125;

const registerSchema = z
  .object({
    role: z.enum(["user", "deliveryman"], { error: "Choose an account type." }),
    name: z
      .string()
      .trim()
      .min(1, "Enter your name.")
      .max(50, "Name must be 50 characters or fewer.")
      .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Use letters and spaces only."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .max(50, "Email must be 50 characters or fewer.")
      .email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(/^\+[1-9]\d{9,14}$/, "Use +country code and 10–15 digits, e.g. +919876543210."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    landmark: z.string().trim().max(100, "Landmark must be 100 characters or fewer.").optional(),
    placeName: z.string().trim().min(1, "Enter your locality or place name.").max(100),
    postalcode: z
      .string()
      .trim()
      .min(3, "Enter your postal code.")
      .max(10, "Postal code must be 10 characters or fewer.")
      .regex(/^[A-Za-z0-9][A-Za-z0-9 -]*$/, "Use letters, numbers, spaces, or hyphens."),
    city: z.string().trim().min(1, "Enter your city.").max(100),
    state: z.string().trim().min(1, "Enter your state.").max(100),
    country: z.string().trim().min(1, "Enter your country.").max(100),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type RegisterValues = z.infer<typeof registerSchema>;

const ACCOUNT_FIELDS = [
  "role",
  "name",
  "email",
  "phone",
  "password",
  "confirmPassword",
] as const;

const ADDRESS_FIELDS = [
  "landmark",
  "placeName",
  "postalcode",
  "city",
  "state",
  "country",
] as const;

const ROLE_OPTIONS = [
  {
    value: "user" as const,
    label: "Renter",
    description: "Rent furniture, electronics, and home essentials.",
    icon: UserRound,
  },
  {
    value: "deliveryman" as const,
    label: "Delivery partner",
    description: "Deliver and collect rentals in your area.",
    icon: Truck,
  },
];

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function isAddressError(message: string): boolean {
  return /address|postal|place|city|state|country|location|geonames/i.test(message);
}

export function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const registerMutation = useRegister();
  const [step, setStep] = useState(0);
  const [otpSentFor, setOtpSentFor] = useState<string | null>(null);
  const [otpVerifiedFor, setOtpVerifiedFor] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpRequestPending, setOtpRequestPending] = useState(false);
  const [otpVerifyPending, setOtpVerifyPending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const next = searchParams.get("next");

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: undefined,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      landmark: "",
      placeName: "",
      postalcode: "",
      city: "",
      state: "",
      country: "India",
    },
    mode: "onTouched",
  });

  const emailValue = useWatch({ control: form.control, name: "email" });
  const normalizedEmail = normalizeEmail(emailValue ?? "");

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(resolveAuthRedirect(next, user.role));
    }
  }, [authLoading, next, router, user]);

  const handleEmailChange = (value: string) => {
    const email = normalizeEmail(value);
    if (otpSentFor && email !== otpSentFor) {
      setOtpSentFor(null);
      setOtpVerifiedFor(null);
      setOtpCode("");
      setOtpError(null);
      setCountdown(0);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timeout = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [countdown]);

  const sendOtp = (email: string) => {
    setOtpError(null);
    setOtpRequestPending(true);
    requestOtp(email)
      .then((response) => {
        setOtpSentFor(email);
        setOtpVerifiedFor(null);
        setCountdown(OTP_RESEND_SECONDS);
        toast.success(response.message || "Verification code sent.");
      })
      .catch((error: unknown) => {
        setOtpError(
          getApiErrorMessage(error, "Could not send the code. Please try again."),
        );
      })
      .finally(() => setOtpRequestPending(false));
  };

  const handleAccountContinue = async () => {
    const valid = await form.trigger([...ACCOUNT_FIELDS]);
    if (!valid) return;

    const email = normalizeEmail(form.getValues("email"));
    setStep(1);

    if (otpVerifiedFor !== email && otpSentFor !== email && !otpRequestPending) {
      sendOtp(email);
    }
  };

  const handleVerifyOtp = () => {
    if (!/^\d{6}$/.test(otpCode)) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }
    setOtpError(null);
    setOtpVerifyPending(true);
    verifyOtp(normalizedEmail, otpCode)
      .then(() => {
        setOtpVerifiedFor(normalizedEmail);
        toast.success("Email verified.");
        setStep(2);
      })
      .catch((error: unknown) => {
        setOtpError(
          getApiErrorMessage(
            error,
            "That code is invalid or has expired. Request a new code.",
          ),
        );
      })
      .finally(() => setOtpVerifyPending(false));
  };

  const handleOtpContinue = () => {
    if (otpVerifiedFor !== normalizedEmail) {
      setOtpError("Verify your email before continuing.");
      return;
    }
    setOtpError(null);
    setStep(2);
  };

  const handleAddressContinue = async () => {
    const valid = await form.trigger([...ADDRESS_FIELDS]);
    if (!valid) return;
    setAddressError(null);
    setStep(3);
  };

  const handleRegisterError = (error: unknown) => {
    const message = getApiErrorMessage(
      error,
      "We could not create your account. Please try again.",
    );

    if (/already exists/i.test(message)) {
      setStep(0);
      form.setError("email", { type: "server", message });
      toast.error("That email is already registered.");
      return;
    }
    if (/not verified/i.test(message)) {
      setStep(1);
      setOtpVerifiedFor(null);
      setOtpError(message);
      return;
    }
    if (isAddressError(message)) {
      setStep(2);
      setAddressError(message);
      return;
    }
    setRegisterError(message);
  };

  const onSubmit = (values: RegisterValues) => {
    setRegisterError(null);
    setAddressError(null);
    const email = normalizeEmail(values.email);

    if (otpVerifiedFor !== email) {
      setStep(1);
      setOtpError("Verify this email before creating your account.");
      return;
    }

    registerMutation.mutate(
      {
        name: values.name.trim(),
        email,
        password: values.password,
        role: values.role,
        phone: values.phone.trim(),
        landmark: values.landmark?.trim() || undefined,
        placeName: values.placeName.trim(),
        postalcode: values.postalcode.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        country: values.country.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Account created. Sign in to continue.");
          const params = new URLSearchParams({ email, registered: "1" });
          if (next) params.set("next", next);
          router.replace(`/login?${params.toString()}`);
        },
        onError: handleRegisterError,
      },
    );
  };

  const submitForm = form.handleSubmit(onSubmit, (errors) => {
    const firstStep = ACCOUNT_FIELDS.some((field) => errors[field])
      ? 0
      : ADDRESS_FIELDS.some((field) => errors[field])
        ? 2
        : 3;
    setStep(firstStep);
  });

  if (authLoading) {
    return (
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
          <div className="h-9 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="h-2 w-full animate-pulse rounded-pill bg-secondary" />
          <div className="h-96 rounded-panel bg-secondary" />
        </div>
      </div>
    );
  }

  const values = form.getValues();
  const isDeliveryPartner = values.role === "deliveryman";

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to sign in
        </Link>

        <p className="mt-6 text-caption text-primary">Create account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Join Rentify
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          A few details, then you can save rentals and manage your orders.
        </p>

        <div className="mt-8">
          <RegisterStepper current={step} />
        </div>

        <Card className="mt-5 p-5 sm:p-7">
          <Form {...form}>
            <form
              onSubmit={(event) => {
                if (step !== 3) {
                  event.preventDefault();
                  return;
                }
                void submitForm(event);
              }}
              noValidate
            >
              {step === 0 ? (
                <AccountStep form={form} onEmailChange={handleEmailChange} />
              ) : null}

              {step === 1 ? (
                <OtpStep
                  email={normalizedEmail}
                  code={otpCode}
                  onCodeChange={(value) => {
                    setOtpCode(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                    setOtpError(null);
                  }}
                  error={otpError}
                  sending={otpRequestPending}
                  verifying={otpVerifyPending}
                  verified={otpVerifiedFor === normalizedEmail}
                  countdown={countdown}
                  onVerify={handleVerifyOtp}
                  onResend={() => sendOtp(normalizedEmail)}
                  onEditEmail={() => setStep(0)}
                />
              ) : null}

              {step === 2 ? (
                <AddressStep form={form} addressError={addressError} />
              ) : null}

              {step === 3 ? (
                <ReviewStep
                  values={values}
                  isDeliveryPartner={isDeliveryPartner}
                  registerError={registerError}
                  pending={registerMutation.isPending}
                  onEdit={setStep}
                />
              ) : null}

              <div className="mt-8 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((current) => Math.max(0, current - 1))}
                      disabled={registerMutation.isPending}
                    >
                      <ArrowLeft aria-hidden="true" />
                      Back
                    </Button>
                  ) : (
                    <Button asChild variant="ghost">
                      <Link href="/login">Already have an account?</Link>
                    </Button>
                  )}
                </div>

                {step === 0 ? (
                  <Button type="button" onClick={() => void handleAccountContinue()}>
                    Continue
                    <ArrowRight aria-hidden="true" />
                  </Button>
                ) : null}

                {step === 1 ? (
                  <Button
                    type="button"
                    onClick={handleOtpContinue}
                    disabled={otpVerifiedFor !== normalizedEmail}
                  >
                    Continue
                    <ArrowRight aria-hidden="true" />
                  </Button>
                ) : null}

                {step === 2 ? (
                  <Button type="button" onClick={() => void handleAddressContinue()}>
                    Review details
                    <ArrowRight aria-hidden="true" />
                  </Button>
                ) : null}

                {step === 3 ? (
                  <Button type="submit" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Creating account…" : "Create account"}
                  </Button>
                ) : null}
              </div>
            </form>
          </Form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function AccountStep({
  form,
  onEmailChange,
}: {
  form: UseFormReturn<RegisterValues>;
  onEmailChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Account details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you will use Rentify, then add your sign-in details.
        </p>
      </div>

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <p id="account-type-label" className="text-sm font-medium">
              Account type
            </p>
            <FormControl>
              <RadioGroup
                aria-labelledby="account-type-label"
                value={field.value}
                onValueChange={field.onChange}
                className="grid gap-3 sm:grid-cols-2"
              >
                {ROLE_OPTIONS.map((option) => {
                  const selected = field.value === option.value;
                  return (
                    <label
                      key={option.value}
                      htmlFor={`role-${option.value}`}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-card border p-4 transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <RadioGroupItem
                        id={`role-${option.value}`}
                        value={option.value}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <option.icon aria-hidden="true" className="size-4 text-primary" />
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="name" placeholder="Aarav Sharma" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+919876543210"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
                onChange={(event) => {
                  field.onChange(event);
                  onEmailChange(event.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
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
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function OtpStep({
  email,
  code,
  onCodeChange,
  error,
  sending,
  verifying,
  verified,
  countdown,
  onVerify,
  onResend,
  onEditEmail,
}: {
  email: string;
  code: string;
  onCodeChange: (value: string) => void;
  error: string | null;
  sending: boolean;
  verifying: boolean;
  verified: boolean;
  countdown: number;
  onVerify: () => void;
  onResend: () => void;
  onEditEmail: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Verify your email</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          We send a 6-digit code to your email. The code expires after about 2 minutes.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-card border border-border bg-secondary/45 p-3">
        <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-medium">Code sent to</p>
          <p className="truncate text-sm text-muted-foreground">{email || "your email"}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto shrink-0"
          onClick={onEditEmail}
        >
          Change
        </Button>
      </div>

      {verified ? (
        <div
          role="status"
          className="flex gap-2.5 rounded-card border border-success/25 bg-success/8 p-3 text-sm text-success"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Email verified</p>
            <p className="mt-0.5 text-xs leading-5 text-success/80">
              You can continue to add your address.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label htmlFor="otp-code" className="block text-sm font-medium">
            Verification code
          </label>
          <Input
            id="otp-code"
            name="otp"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onVerify();
              }
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={OTP_LENGTH}
            placeholder="000000"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "otp-error" : "otp-help"}
            className="text-center font-mono text-lg tracking-[0.45em]"
          />
          <p id="otp-help" className="text-xs text-muted-foreground">
            Check your spam folder if it does not arrive within a minute.
          </p>
          {error ? (
            <p id="otp-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={onVerify} disabled={sending || verifying || code.length < 6}>
              {verifying ? "Verifying…" : "Verify email"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResend}
              disabled={sending || verifying || countdown > 0}
            >
              {sending
                ? "Sending…"
                : countdown > 0
                  ? `Resend in ${formatCountdown(countdown)}`
                  : "Resend code"}
            </Button>
          </div>
        </div>
      )}

      {sending && !verified ? (
        <p role="status" className="text-sm text-muted-foreground">
          Sending a new code…
        </p>
      ) : null}
    </div>
  );
}

function AddressStep({
  form,
  addressError,
}: {
  form: UseFormReturn<RegisterValues>;
  addressError: string | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Delivery address</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          We use this address for delivery and return pickup.
        </p>
      </div>

      <div className="flex gap-2.5 rounded-card border border-border bg-secondary/45 p-3">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="text-xs leading-5 text-muted-foreground">
          <p className="font-medium text-foreground">Address lookup is temporarily unavailable</p>
          <p className="mt-1">
            Enter your address exactly as it appears in postal records. Locality, city, state,
            and country must match.
          </p>
        </div>
      </div>

      {addressError ? (
        <div
          role="alert"
          className="rounded-card border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {addressError}
        </div>
      ) : null}

      <FormField
        control={form.control}
        name="landmark"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Landmark <span className="font-normal text-muted-foreground">(optional)</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Near metro station" autoComplete="address-line2" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Locality / place</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Andheri" autoComplete="address-line3" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="postalcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="400053" autoComplete="postal-code" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} placeholder="India" autoComplete="country-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mumbai" autoComplete="address-level2" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Maharashtra" autoComplete="address-level1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function ReviewStep({
  values,
  isDeliveryPartner,
  registerError,
  pending,
  onEdit,
}: {
  values: RegisterValues;
  isDeliveryPartner: boolean;
  registerError: string | null;
  pending: boolean;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Review and create</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Check your details before creating the account. You can edit any section.
        </p>
      </div>

      {registerError ? (
        <div
          role="alert"
          className="rounded-card border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {registerError}
        </div>
      ) : null}

      {isDeliveryPartner ? (
        <div className="flex gap-2.5 rounded-card border border-warning/30 bg-warning/10 p-3 text-sm">
          <Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">Delivery partner accounts need approval.</span>{" "}
            An admin reviews your account before you can accept deliveries.
          </p>
        </div>
      ) : null}

      <ReviewSection title="Account" onEdit={() => onEdit(0)}>
        <ReviewRow label="Type" value={isDeliveryPartner ? "Delivery partner" : "Renter"} />
        <ReviewRow label="Name" value={values.name} />
        <ReviewRow label="Email" value={values.email} />
        <ReviewRow label="Phone" value={values.phone} />
      </ReviewSection>

      <ReviewSection title="Delivery address" onEdit={() => onEdit(2)}>
        {values.landmark ? <ReviewRow label="Landmark" value={values.landmark} /> : null}
        <ReviewRow label="Locality" value={values.placeName} />
        <ReviewRow
          label="City, state"
          value={`${values.city}, ${values.state}`}
        />
        <ReviewRow label="Postal code" value={values.postalcode} />
        <ReviewRow label="Country" value={values.country} />
      </ReviewSection>

      <div className="flex gap-2.5 rounded-card border border-border bg-secondary/40 p-3 text-xs leading-5 text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
        <p>
          Your password and session are protected. By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {pending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Creating your account…
        </p>
      ) : null}
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <dl className="divide-y divide-border px-4">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{value}</dd>
    </div>
  );
}
