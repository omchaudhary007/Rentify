"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getProfile, login, type LoginInput } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import type { User } from "@/types/user";

export interface LoginResult {
  message: string;
  user: User;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput): Promise<LoginResult> => {
      const response = await login(input);
      const user = await getProfile();
      return { message: response.message, user };
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(queryKeys.me, user);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}.`);
    },
  });
}
