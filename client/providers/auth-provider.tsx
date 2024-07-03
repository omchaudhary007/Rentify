"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";

import { getProfile, logout as logoutRequest } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import type { Role, User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionError: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const profileQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: getProfile,
    retry: false,
    staleTime: 60_000,
  });

  const logout = useCallback(async () => {
    await logoutRequest();
    queryClient.clear();
    router.replace("/");
  }, [queryClient, router]);

  const value = useMemo<AuthContextValue>(() => {
    const user = profileQuery.data ?? null;
    return {
      user,
      role: user?.role ?? null,
      isLoading: profileQuery.isLoading,
      isAuthenticated: Boolean(user),
      isSessionError: profileQuery.isError && !profileQuery.data,
      refetch: () => {
        void profileQuery.refetch();
      },
      logout,
    };
  }, [logout, profileQuery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
