"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  updateProfile,
  updateProfilePicture,
  type ProfileUpdateInput,
} from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import type { CloudinaryImage, User } from "@/types/user";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
      toast.success("Profile updated.");
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => updateProfilePicture(file),
    onSuccess: (profilePic: CloudinaryImage) => {
      queryClient.setQueryData<User | null>(queryKeys.me, (current) =>
        current ? { ...current, profilePic } : current,
      );
      toast.success("Profile picture updated.");
    },
  });
}
