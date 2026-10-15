import { createFileRoute } from "@tanstack/react-router";
import * as P from "@/components/pages/workspace";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "All Customers — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <P.CustomersPage admin />,
});
