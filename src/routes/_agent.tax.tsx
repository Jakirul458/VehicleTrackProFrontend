import { createFileRoute } from "@tanstack/react-router";
import { DocumentModulePage } from "@/components/documents/DocumentModulePage";

export const Route = createFileRoute("/_agent/tax")({
  head: () => ({ meta: [{ title: "Tax — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <DocumentModulePage moduleKey="tax" />,
});
