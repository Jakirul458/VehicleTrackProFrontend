import { apiClient, createResourceApi, request, type ListParams } from "./client";
import type {
  Agent,
  ActivityLog,
  DashboardStats,
  AgentDashboardStats,
  Insurance,
  Tax,
  Puc,
  RemindersResponse,
  PlatformSettings,
  AgentFinancialSummary,
  PaymentRecordsResponse,
  ActiveAuthSession,
  ModuleAccess,
} from "@/types";

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
      request<{
        data: Agent[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>(apiClient.get("/admin/agents", { params })),
    get: (id: string) => request<Agent>(apiClient.get(`/admin/agents/${id}`)),
    create: (payload: CreateAgentInput) => request<Agent>(apiClient.post("/admin/agents", payload)),
    update: (id: string, payload: Partial<CreateAgentInput>) =>
      request<Agent>(apiClient.put(`/admin/agents/${id}`, payload)),
    updateStatus: (id: string, status: "ACTIVE" | "SUSPENDED") =>
      request<Agent>(apiClient.patch(`/admin/agents/${id}/status`, { status })),
    updateModuleAccess: (id: string, moduleAccess: ModuleAccess) =>
      request<Agent>(apiClient.patch(`/admin/agents/${id}/module-access`, { moduleAccess })),
    updateValidity: (id: string, trialEndDate: string) =>
      request<Agent>(apiClient.patch(`/admin/agents/${id}/validity`, { trialEndDate })),
    resetPassword: (id: string, newPassword: string) =>
      request<{ success: boolean }>(
        apiClient.patch(`/admin/agents/${id}/password`, { newPassword }),
      ),
    delete: (id: string) => request<{ success: boolean }>(apiClient.delete(`/admin/agents/${id}`)),
  },
  activity: {
    list: (params?: ListParams) =>
      request<{
        data: ActivityLog[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>(apiClient.get("/admin/activity", { params })),
    export: (params?: ListParams) =>
      apiClient.get("/admin/activity/export", { params, responseType: "blob" }),
  },
  sessions: {
    list: () => request<ActiveAuthSession[]>(apiClient.get("/admin/sessions")),
    revoke: (id: string) =>
      request<{ success: boolean }>(apiClient.delete(`/admin/sessions/${id}`)),
  },
  settings: {
    get: () => request<PlatformSettings>(apiClient.get("/admin/settings")),
    update: (settings: PlatformSettings) =>
      request<PlatformSettings>(apiClient.put("/admin/settings", settings)),
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
  moduleAccess?: ModuleAccess;
}

export const reportApi = {
  agentDashboard: () => request<AgentDashboardStats>(apiClient.get("/reports/dashboard")),
  agentFinances: () => request<AgentFinancialSummary>(apiClient.get("/reports/agent-finances")),
  payments: () => request<PaymentRecordsResponse>(apiClient.get("/reports/payments")),
  adminDashboard: () => request<DashboardStats>(apiClient.get("/reports/admin-dashboard")),
};

export const paymentApi = {
  settings: () => request<PlatformSettings>(apiClient.get("/settings/payment")),
};

export const remindersApi = {
  list: () => request<RemindersResponse>(apiClient.get("/reminders")),
};

export const contactApi = {
  send: (payload: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) => request<{ success: boolean }>(apiClient.post("/contact", payload)),
};
