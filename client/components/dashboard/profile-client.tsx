"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, Info, ShieldCheck, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  useUpdateAvatar,
  useUpdateProfile,
} from "@/hooks/mutations/use-profile-mutations";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatDate, initials } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/types/user";

const MAX_AVATAR_BYTES = 1024 * 1024;

const ROLE_LABEL: Record<Role, string> = {
  user: "Renter",
  deliveryman: "Delivery partner",
  admin: "Admin",
};

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(50, "Name must be 50 characters or fewer.")
    .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, "Use letters and spaces only."),
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{9,14}$/, "Use +country code and 10–15 digits, e.g. +919876543210."),
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
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileClient() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      landmark: user?.address?.landmark ?? "",
      placeName: user?.address?.placeName ?? "",
      postalcode: user?.address?.postalcode ?? "",
      city: user?.address?.city ?? "",
      state: user?.address?.state ?? "",
      country: user?.address?.country ?? "",
    },
  });

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  if (!user) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image is too large. Please use a file under 1 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setAvatarError(null);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setAvatarError(null);
    updateAvatar.mutate(selectedFile, {
      onSuccess: () => {
        setPreviewUrl(null);
        setSelectedFile(null);
      },
      onError: (error) => {
        setAvatarError(
          getApiErrorMessage(error, "Could not upload your photo. Please try again."),
        );
      },
    });
  };

  const onSubmit = (values: ProfileValues) => {
    setSaveError(null);
    updateProfile.mutate(
      {
        name: values.name.trim(),
        phone: values.phone.trim(),
        landmark: values.landmark?.trim() ?? "",
        placeName: values.placeName.trim(),
        postalcode: values.postalcode.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        country: values.country.trim(),
      },
      {
        onError: (error) => {
          setSaveError(
            getApiErrorMessage(error, "Could not save your profile. Please try again."),
          );
        },
      },
    );
  };

  const displayPhoto = previewUrl ?? user.profilePic?.url ?? undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Update your personal details and delivery address. Your email and role are managed separately."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Profile photo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A clear photo helps delivery partners recognise you.
            </p>

            <div className="mt-5 flex flex-col items-center gap-4">
              <Avatar className="size-24">
                <AvatarImage src={displayPhoto} alt={user.name} />
                <AvatarFallback className="bg-secondary text-2xl font-semibold text-primary">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap justify-center gap-2">
                {previewUrl ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUpload}
                      disabled={updateAvatar.isPending}
                    >
                      <Upload aria-hidden="true" />
                      {updateAvatar.isPending ? "Uploading…" : "Save photo"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={cancelPreview}
                      disabled={updateAvatar.isPending}
                    >
                      <X aria-hidden="true" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateAvatar.isPending}
                  >
                    <Camera aria-hidden="true" />
                    {updateAvatar.isPending ? "Uploading…" : "Choose photo"}
                  </Button>
                )}
              </div>

              {avatarError ? (
                <p role="alert" className="text-center text-xs text-destructive">
                  {avatarError}
                </p>
              ) : null}
              {!previewUrl && !avatarError ? (
                <p className="text-center text-xs text-muted-foreground">
                  JPEG, PNG, or WebP · up to 1 MB
                </p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-0.5 break-all font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Role</dt>
                <dd className="mt-1">
                  <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Member since</dt>
                <dd className="mt-0.5 font-medium">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  {user.isVerified ? (
                    <Badge variant="success">
                      <ShieldCheck aria-hidden="true" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning">Verification pending</Badge>
                  )}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
              To change your email, password, or delete your account, open Security.
            </p>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
              <Card className="p-5 sm:p-6">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">Personal details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  These details appear on your account and delivery updates.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="name" />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Card className="p-5 sm:p-6">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">Delivery address</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We use this address for delivery and return pickup.
                </p>

                <div className="mt-4 flex gap-2.5 rounded-card border border-border bg-secondary/45 p-3">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Address lookup is temporarily unavailable. Enter details exactly as they
                    appear in postal records; locality, city, state, and country must match.
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <FormField
                    control={form.control}
                    name="landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Landmark{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="address-line2" />
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
                          <Input {...field} autoComplete="address-line3" />
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
                            <Input {...field} autoComplete="postal-code" />
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
                            <Input {...field} autoComplete="country-name" />
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
                            <Input {...field} autoComplete="address-level2" />
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
                            <Input {...field} autoComplete="address-level1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>

              {saveError ? (
                <div
                  role="alert"
                  className="rounded-card border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {saveError}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 aria-hidden="true" className="size-3.5 text-success" />
                  Changes update your account immediately.
                </p>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
