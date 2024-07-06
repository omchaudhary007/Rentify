import { RequireRole } from "@/components/auth/guards";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["admin"]}>{children}</RequireRole>;
}
