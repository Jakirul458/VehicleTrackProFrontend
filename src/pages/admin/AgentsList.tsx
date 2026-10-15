import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api';
import type { Agent } from '@/types';
import { Plus, Edit, Trash2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { daysLeft } from '@/lib/expiry';

function validityText(date?: string) {
  if (!date) return { label: 'Not set', color: 'text-muted-foreground' };
  const remaining = daysLeft(date);
  if (remaining === null) return { label: 'Not set', color: 'text-muted-foreground' };
  if (remaining < 0) return { label: 'Expired', color: 'text-status-expired' };
  if (remaining <= 7) return { label: 'Urgent', color: 'text-status-urgent' };
  if (remaining <= 30) return { label: 'Due soon', color: 'text-status-due' };
  return { label: 'Active', color: 'text-status-active' };
}

export default function AgentsList() {
  const queryClient = useQueryClient();
  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: () => adminApi.agents.list(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete agent ${name}? This is a destructive operation.`)) {
      return;
    }
    try {
      await adminApi.agents.delete(id);
      toast.success('Agent deleted successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    } catch (error) {
      toast.error('Failed to delete agent');
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Link
          to="/admin/agents/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Agent</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Business</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Validity</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents && agents.length > 0 ? (
              agents.map((agent) => (
                <tr key={agent.id} className="border-t">
                  <td className="px-6 py-4">
                    <div className="font-medium">{agent.fullName}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{agent.businessName || '-'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{agent.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">{agent.mobile}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        agent.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {agent.status === 'ACTIVE' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {agent.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${validityText(agent.trialEndDate).color}`}>
                    {validityText(agent.trialEndDate).label}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/agents/${agent.id}`}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                        title="View"
                      >
                        <Shield className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/agents/${agent.id}/edit`}
                        className="p-2 hover:bg-accent rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(agent.id, agent.fullName)}
                        className="p-2 hover:bg-accent rounded-md transition-colors text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No agents found. Create your first agent to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
