import { createFileRoute } from "@tanstack/react-router";
import * as P from "@/components/pages/workspace";

export const Route = createFileRoute("/_agent/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <P.DashboardPage />,
});
