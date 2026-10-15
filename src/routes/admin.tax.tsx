import { createFileRoute } from "@tanstack/react-router";
import { DocumentModulePage } from "@/components/documents/DocumentModulePage";

export const Route = createFileRoute("/admin/tax")({
  head: () => ({ meta: [{ title: "Tax (All Agents) — VehicleTrack Pro" }, { name: "robots", content: "noindex" }] }),
  component: () => <DocumentModulePage moduleKey="tax" admin />,
});
