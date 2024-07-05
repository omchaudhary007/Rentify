import type { Role } from "@/types/user";

const ROLE_HOME: Record<Role, string> = {
  user: "/account",
  deliveryman: "/delivery",
  admin: "/admin/categories",
};

export function roleHome(role: Role | null | undefined): string {
  return role ? ROLE_HOME[role] : "/";
}

export function safeInternalPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

export function resolveAuthRedirect(
  next: string | null | undefined,
  role: Role | null | undefined,
): string {
  const fallback = roleHome(role);
  const path = safeInternalPath(next, fallback);
  if (path === "/login" || path.startsWith("/login?") || path === "/register") {
    return fallback;
  }
  return path;
}
