import type { AuthResponse } from "@/types/api";

import { api } from "./client";

export async function requestOtp(email: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/otp/request", { email });
  return data;
}

export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/otp/verify", { email, otp });
  return data;
}
