import { apiClient, createResourceApi, request, type ListParams } from "./client";
import type { Agent, ActivityLog, DashboardStats, AgentDashboardStats, Insurance, Tax, Puc } from "@/types";

export { apiClient, request, createResourceApi } from "./client";
export type { ListParams, NormalizedApiError } from "./client";
export {
  authApi,
  type LoginPayload,
  type PublicSignupPayload,
  type SetupSuperAdminPayload,
  type ChangePasswordPayload,
} from "./authApi";

export const insuranceApi = createResourceApi<Insurance>("insurance");
export const taxApi = createResourceApi<Tax>("tax");
export const pucApi = createResourceApi<Puc>("puc");

export const adminApi = {
  agents: {
    list: (params?: ListParams) =>
      request<{ data: Agent[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
        apiClient.get("/admin/agents", { params }),
      ).then((result) => result.data),
    get: (id: string) => request<Agent>(apiClient.get(`/admin/agents/${id}`)),
    create: (payload: CreateAgentInput) => request<Agent>(apiClient.post("/admin/agents", payload)),
    update: (id: string, payload: Partial<CreateAgentInput>) => request<Agent>(apiClient.put(`/admin/agents/${id}`, payload)),
    updateStatus: (id: string, status: "ACTIVE" | "SUSPENDED") => request<Agent>(apiClient.patch(`/admin/agents/${id}/status`, { status })),
    updateValidity: (id: string, trialEndDate: string) =>
      request<Agent>(apiClient.patch(`/admin/agents/${id}/validity`, { trialEndDate })),
    delete: (id: string) => request<{ success: boolean }>(apiClient.delete(`/admin/agents/${id}`)),
  },
  activity: {
    list: (params?: ListParams) => request<{ data: ActivityLog[]; pagination: any }>(apiClient.get("/admin/activity", { params })),
  },
  dashboard: () => request<DashboardStats>(apiClient.get("/admin/dashboard")),
};

export interface CreateAgentInput {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  status: "ACTIVE" | "SUSPENDED";
}

export const reportApi = {
  agentDashboard: () => request<AgentDashboardStats>(apiClient.get("/reports/dashboard")),
  adminDashboard: () => request<DashboardStats>(apiClient.get("/reports/admin-dashboard")),
};

export const contactApi = {
  send: (payload: { name: string; email: string; phone: string; subject: string; message: string }) =>
    request<{ success: boolean }>(apiClient.post("/contact", payload)),
};
