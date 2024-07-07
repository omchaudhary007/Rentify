import type { Metadata } from "next";

import { ProfileClient } from "@/components/dashboard/profile-client";

export const metadata: Metadata = {
  title: "Profile",
  description: "Update your Rentify profile, delivery address, and profile photo.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
