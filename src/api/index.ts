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
  SubscriptionPlan,
  SubscriptionPayment,
  SubscriptionInvoiceUpdate,
  AgentSubscriptionRow,
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
    updateSubscription: (id: string, status: "FREE", trialEndDate: string) =>
      request<Agent>(apiClient.patch(`/admin/agents/${id}/subscription`, { status, trialEndDate })),
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
  plans: () => request<SubscriptionPlan[]>(apiClient.get("/plans")),
  submit: (payload: {
    planId: string;
    utr: string;
    paymentApp: string;
    paymentDate: string;
    screenshot?: string;
  }) => request<SubscriptionPayment>(apiClient.post("/payments/submissions", payload)),
  mine: () => request<SubscriptionPayment[]>(apiClient.get("/payments/submissions")),
  invoice: (id: string) => request<SubscriptionPayment>(apiClient.get(`/payments/invoices/${id}`)),
};

export const subscriptionAdminApi = {
  agents: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      request<{
        data: AgentSubscriptionRow[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>(apiClient.get("/admin/agent-subscriptions", { params })),
    issueInvoice: (
      agentId: string,
      planId: string,
      trialEndDate: string,
      paymentDate: string,
      invoiceOptions: { gstEnabled: boolean; gstRate: number; sellerGstin: string },
    ) =>
      request<SubscriptionPayment>(
        apiClient.post(`/admin/agents/${agentId}/subscription-invoices`, {
          planId,
          trialEndDate,
          paymentDate,
          ...invoiceOptions,
        }),
      ),
  },
  plans: {
    list: () => request<SubscriptionPlan[]>(apiClient.get("/admin/plans")),
    create: (payload: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">) =>
      request<SubscriptionPlan>(apiClient.post("/admin/plans", payload)),
    update: (id: string, payload: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">) =>
      request<SubscriptionPlan>(apiClient.put(`/admin/plans/${id}`, payload)),
    delete: (id: string) => request<{ id: string }>(apiClient.delete(`/admin/plans/${id}`)),
  },
  payments: {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
      request<{
        data: SubscriptionPayment[];
        pagination: { page: number; limit: number; total: number; pages: number };
      }>(apiClient.get("/admin/subscription-payments", { params })),
    get: (id: string) =>
      request<SubscriptionPayment>(apiClient.get(`/admin/subscription-payments/${id}`)),
    review: (
      id: string,
      payload:
        | {
            status: "APPROVED";
            gstEnabled?: boolean;
            gstRate?: number;
            sellerGstin?: string;
          }
        | { status: "REJECTED"; rejectReason: string },
    ) =>
      request<SubscriptionPayment>(apiClient.patch(`/admin/subscription-payments/${id}`, payload)),
    updateInvoice: (id: string, payload: SubscriptionInvoiceUpdate) =>
      request<SubscriptionPayment>(apiClient.put(`/admin/subscription-payments/${id}`, payload)),
    deleteInvoice: (id: string) =>
      request<{ id: string }>(apiClient.delete(`/admin/subscription-payments/${id}`)),
  },
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
