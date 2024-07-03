"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api/errors";
import { logout } from "@/lib/api/auth";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not sign you out. Please try again."));
    },
  });
}
