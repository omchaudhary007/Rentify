import { RequireRole } from "@/components/auth/guards";

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["user"]}>{children}</RequireRole>;
}
