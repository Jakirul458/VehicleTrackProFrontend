import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { adminApi } from "@/api";
import type { Agent } from "@/types";
import { ArrowLeft, CalendarDays, Shield, ShieldAlert } from "lucide-react";
import { DocumentModulePage } from "@/components/documents/DocumentModulePage";
import { toast } from "sonner";

const tabs = [
  { key: "insurance", label: "Insurance" },
  { key: "tax", label: "Tax" },
  { key: "puc", label: "PUC" },
] as const;

export default function AgentDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("insurance");
  const { data: agent, isLoading } = useQuery<Agent>({
    queryKey: ["agent", id],
    queryFn: () => adminApi.agents.get(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div>
        <Link
          to="/admin/agents"
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Link>
        <p className="rounded-lg border bg-card p-6 text-destructive">
          Agent information could not be loaded.
        </p>
      </div>
    );
  }

  const currentAgent = agent;

  async function toggleStatus() {
    const nextStatus = currentAgent.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdating(true);
    try {
      await adminApi.agents.updateStatus(currentAgent.id, nextStatus);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent", id] }),
        queryClient.invalidateQueries({ queryKey: ["agents"] }),
      ]);
      toast.success(`Agent ${nextStatus.toLowerCase()}.`);
    } catch {
      return;
    } finally {
      setUpdating(false);
    }
  }

  async function saveValidity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trialEndDate = String(new FormData(event.currentTarget).get("trialEndDate") ?? "");
    if (!trialEndDate) {
      toast.error("Select a validity date.");
      return;
    }
    setUpdating(true);
    try {
      await adminApi.agents.updateValidity(currentAgent.id, trialEndDate);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["agent", id] }),
        queryClient.invalidateQueries({ queryKey: ["agents"] }),
      ]);
      toast.success("Agent validity date updated.");
    } catch {
      return;
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <Link
        to="/admin/agents"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agents
      </Link>
      <h1 className="text-3xl font-bold mb-2">{agent.fullName}</h1>
      <p className="mb-6 text-muted-foreground">{agent.businessName || "Agent profile"}</p>

      <dl className="mb-8 grid gap-4 rounded-lg border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Mobile</dt>
          <dd className="font-medium">{agent.mobile || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="font-medium">{agent.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Business</dt>
          <dd className="font-medium">{agent.businessName || "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Status</dt>
          <dd className="font-medium">{agent.status}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Validity date</dt>
          <dd className="font-medium">
            {agent.trialEndDate
              ? new Date(agent.trialEndDate).toLocaleDateString("en-IN", { timeZone: "UTC" })
              : "Not set"}
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <dt className="text-sm text-muted-foreground">Address</dt>
          <dd className="font-medium">
            {[agent.address, agent.city, agent.state, agent.pinCode].filter(Boolean).join(", ") ||
              "—"}
          </dd>
        </div>
      </dl>

      <section className="mb-8 grid gap-4 rounded-lg border bg-card p-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">Account access</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {agent.status === "ACTIVE"
              ? "This agent can currently sign in."
              : "This agent is suspended and cannot sign in."}
          </p>
          <button
            type="button"
            disabled={updating}
            onClick={() => void toggleStatus()}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              agent.status === "ACTIVE"
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {agent.status === "ACTIVE" ? (
              <ShieldAlert className="size-4" />
            ) : (
              <Shield className="size-4" />
            )}
            {agent.status === "ACTIVE" ? "Suspend agent" : "Activate agent"}
          </button>
        </div>
        <form onSubmit={(event) => void saveValidity(event)} className="space-y-3">
          <label htmlFor="trialEndDate" className="block font-semibold">
            Agent validity
          </label>
          <p className="text-sm text-muted-foreground">
            The agent can use the system through the selected date.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              id="trialEndDate"
              name="trialEndDate"
              type="date"
              required
              defaultValue={agent.trialEndDate?.slice(0, 10) ?? ""}
              className="h-10 rounded-md border border-input bg-background px-3"
            />
            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              <CalendarDays className="size-4" /> Save date
            </button>
          </div>
        </form>
      </section>

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Agent documents">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "border bg-card hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <DocumentModulePage key={`${id}-${activeTab}`} moduleKey={activeTab} admin agentId={id} />
    </div>
  );
}
