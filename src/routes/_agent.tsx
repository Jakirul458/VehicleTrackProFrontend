import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AGENT_NAV } from "@/constants/navigation";

export const Route = createFileRoute("/_agent")({
  component: () => (
    <AppShell nav={AGENT_NAV} role="AGENT">
      <Outlet />
    </AppShell>
  ),
});
