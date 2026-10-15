import { createFileRoute } from "@tanstack/react-router";
import { DocumentModulePage } from "@/components/documents/DocumentModulePage";

export const Route = createFileRoute("/_agent/insurance")({
  head: () => ({ meta: [{ title: "Insurance — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <DocumentModulePage moduleKey="insurance" />,
});
