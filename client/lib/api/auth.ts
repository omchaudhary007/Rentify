import type { AuthResponse, ProfileResponse } from "@/types/api";
import type { Role, User } from "@/types/user";

import { api } from "./client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, "admin">;
  phone: string;
  landmark?: string;
  placeName: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
}

export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  landmark?: string;
  placeName?: string;
  postalcode?: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<ProfileResponse>("/user/profile");
  return data.user;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/user/login", input);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/user/register", input);
  return data;
}

export async function logout(): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/user/logout");
  return data;
}

export async function updateProfile(input: ProfileUpdateInput): Promise<User> {
  const { data } = await api.patch<ProfileResponse>("/user/profile", input);
  return data.user;
}

export async function updateProfilePicture(file: File): Promise<{ url: string | null }> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.patch<{
    success: boolean;
    message: string;
    profilePic: { public_id: string | null; url: string | null };
  }>("/user/profile/picture", form);
  return data.profilePic;
}

export async function updateEmail(newemail: string): Promise<User> {
  const { data } = await api.patch<ProfileResponse>("/user/profile/email", { newemail });
  return data.user;
}

export async function updatePassword(input: {
  oldpassword: string;
  newpassword: string;
}): Promise<AuthResponse> {
  const { data } = await api.patch<AuthResponse>("/user/profile/password", input);
  return data;
}

export async function deleteAccount(): Promise<AuthResponse> {
  const { data } = await api.delete<AuthResponse>("/user/profile");
  return data;
}
