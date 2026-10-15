import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ADMIN_NAV } from "@/constants/navigation";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AppShell nav={ADMIN_NAV} role="SUPER_ADMIN">
      <Outlet />
    </AppShell>
  ),
});
