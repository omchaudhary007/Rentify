"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteAccount,
  updateEmail,
  updatePassword,
} from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newemail: string) => updateEmail(newemail),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
      toast.success("Email updated.");
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (input: { oldpassword: string; newpassword: string }) =>
      updatePassword(input),
    onSuccess: () => {
      toast.success("Password changed.");
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Your account has been deleted.");
      router.replace("/");
    },
  });
}
