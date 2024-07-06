import { RequireRole } from "@/components/auth/guards";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["deliveryman"]}>{children}</RequireRole>;
}
