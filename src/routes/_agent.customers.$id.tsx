import { createFileRoute } from "@tanstack/react-router";
import { CustomerDetailPage } from "@/components/pages/workspace";

export const Route = createFileRoute("/_agent/customers/$id")({
  head: () => ({ meta: [{ title: "Customer — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  return <CustomerDetailPage id={id} />;
}
