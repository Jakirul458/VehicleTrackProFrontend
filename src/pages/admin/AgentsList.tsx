import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "@/api";
import type { Agent } from "@/types";
import { Plus, Edit, Trash2, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { daysLeft, formatDateTime } from "@/lib/expiry";
import { PageHeader, Panel, TablePagination } from "@/components/common";

function validityText(date?: string) {
  if (!date) return { label: "Not set", color: "text-muted-foreground" };
  const remaining = daysLeft(date);
  if (remaining === null) return { label: "Not set", color: "text-muted-foreground" };
  if (remaining < 0) return { label: "Expired", color: "text-status-expired" };
  if (remaining <= 7) return { label: "Urgent", color: "text-status-urgent" };
  if (remaining <= 30) return { label: "Due soon", color: "text-status-due" };
  return { label: "Active", color: "text-status-active" };
}

export default function AgentsList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: result, isLoading } = useQuery({
    queryKey: ["agents", page, limit],
    queryFn: () => adminApi.agents.list({ page, limit }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(`Are you sure you want to delete agent ${name}? This is a destructive operation.`)
    ) {
      return;
    }
    try {
      await adminApi.agents.delete(id);
      toast.success("Agent deleted successfully");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    } catch (error) {
      toast.error("Failed to delete agent");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Agents"
        description="Manage agent accounts, access, and subscription validity."
        actions={
          <Link
            to="/admin/agents/new"
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </Link>
        }
      />

      <Panel title="Agent directory" description="Review and manage all registered agents.">
        <div className="overflow-hidden rounded-xl border shadow-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-primary/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide">
                  <th className="bg-sky-700 px-4 py-3 text-white">Agent</th>
                  <th className="bg-blue-700 px-4 py-3 text-white">Business</th>
                  <th className="bg-indigo-700 px-4 py-3 text-white">Email</th>
                  <th className="bg-cyan-700 px-4 py-3 text-white">Phone</th>
                  <th className="bg-teal-700 px-4 py-3 text-white">Status</th>
                  <th className="bg-emerald-700 px-4 py-3 text-white">Validity</th>
                  <th className="bg-slate-700 px-4 py-3 text-white">Created</th>
                  <th className="bg-slate-700 px-4 py-3 text-right text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result?.data.length ? (
                  result.data.map((agent: Agent) => {
                    const validity = validityText(agent.trialEndDate);
                    return (
                      <tr key={agent.id} className="border-b border-border/60 last:border-0">
                        <td className="whitespace-nowrap bg-sky-500/5 px-4 py-3 font-medium">
                          {agent.fullName}
                        </td>
                        <td className="whitespace-nowrap bg-blue-500/5 px-4 py-3 text-muted-foreground">
                          {agent.businessName || "—"}
                        </td>
                        <td className="whitespace-nowrap bg-indigo-500/5 px-4 py-3 text-muted-foreground">
                          {agent.email}
                        </td>
                        <td className="whitespace-nowrap bg-cyan-500/5 px-4 py-3 text-muted-foreground">
                          {agent.mobile}
                        </td>
                        <td className="whitespace-nowrap bg-teal-500/5 px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              agent.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {agent.status === "ACTIVE" ? (
                              <Shield className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {agent.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap bg-emerald-500/5 px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${validity.color}`}
                          >
                            {validity.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap bg-slate-500/5 px-4 py-3 text-muted-foreground">
                          {formatDateTime(agent.createdAt)}
                        </td>
                        <td className="whitespace-nowrap bg-slate-500/5 px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/admin/agents/${agent.id}`}
                              className="rounded-md p-2 transition-colors hover:bg-accent"
                              title="View"
                            >
                              <Shield className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/admin/agents/${agent.id}/edit`}
                              className="rounded-md p-2 transition-colors hover:bg-accent"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(agent.id, agent.fullName)}
                              className="rounded-md p-2 text-destructive transition-colors hover:bg-accent"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No agents found. Create your first agent to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={result?.pagination.page ?? page}
            limit={result?.pagination.limit ?? limit}
            total={result?.pagination.total ?? 0}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </Panel>
    </div>
  );
}
