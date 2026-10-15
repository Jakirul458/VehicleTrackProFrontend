import { createFileRoute } from "@tanstack/react-router";
import * as P from "@/components/pages/workspace";

export const Route = createFileRoute("/_agent/customers/")({
  head: () => ({ meta: [{ title: "Customers — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <P.CustomersPage />,
});
