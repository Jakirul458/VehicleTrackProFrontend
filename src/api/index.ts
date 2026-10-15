import { apiClient, createResourceApi, request, type ListParams } from "./client";
import type { Agent, Customer, Vehicle, ActivityLog, DashboardStats, AgentDashboardStats, Insurance, Tax, Puc } from "@/types";

export { apiClient, request, createResourceApi } from "./client";
export type { ListParams, NormalizedApiError } from "./client";
export { authApi, type LoginPayload, type SetupSuperAdminPayload, type ChangePasswordPayload } from "./authApi";

export const customerApi = createResourceApi<Customer>("customers");
export const vehicleApi = createResourceApi<Vehicle>("vehicles");
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
    create: (payload: Omit<any, "confirmPassword">) => request<Agent>(apiClient.post("/admin/agents", payload)),
    update: (id: string, payload: Partial<Agent>) => request<Agent>(apiClient.put(`/admin/agents/${id}`, payload)),
    updateStatus: (id: string, status: "ACTIVE" | "SUSPENDED") => request<Agent>(apiClient.patch(`/admin/agents/${id}/status`, { status })),
    updateValidity: (id: string, trialEndDate: string) =>
      request<Agent>(apiClient.patch(`/admin/agents/${id}/validity`, { trialEndDate })),
    updatePassword: (id: string, password: string) => request<{ id: string; updated: boolean }>(apiClient.patch(`/admin/agents/${id}/password`, { password })),
    extendValidity: (id: string, days: number, plan?: "TRIAL" | "BASIC" | "PRO") => request<Agent>(apiClient.patch(`/admin/agents/${id}/extend-validity`, { days, plan })),
    delete: (id: string) => request<{ success: boolean }>(apiClient.delete(`/admin/agents/${id}`)),
  },
  activity: {
    list: (params?: ListParams) => request<{ data: ActivityLog[]; pagination: any }>(apiClient.get("/admin/activity", { params })),
  },
  dashboard: () => request<DashboardStats>(apiClient.get("/admin/dashboard")),
};

export const reportApi = {
  agentDashboard: () => request<AgentDashboardStats>(apiClient.get("/reports/dashboard")),
  adminDashboard: () => request<DashboardStats>(apiClient.get("/reports/admin-dashboard")),
};

export const contactApi = {
  send: (payload: { name: string; email: string; phone: string; subject: string; message: string }) =>
    request<{ success: boolean }>(apiClient.post("/contact", payload)),
};
