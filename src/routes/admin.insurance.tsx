import { createFileRoute } from "@tanstack/react-router";
import { DocumentModulePage } from "@/components/documents/DocumentModulePage";

export const Route = createFileRoute("/admin/insurance")({
  head: () => ({ meta: [{ title: "Insurance (All Agents) — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <DocumentModulePage moduleKey="insurance" admin />,
});
