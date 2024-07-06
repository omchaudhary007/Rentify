import { RequireRole } from "@/components/auth/guards";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["user"]}>{children}</RequireRole>;
}
