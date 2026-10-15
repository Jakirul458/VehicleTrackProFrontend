import { createFileRoute } from "@tanstack/react-router";
import * as P from "@/components/pages/workspace";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <P.DashboardPage admin />,
});
