import { apiClient, request } from "./client";
import type { User, Agent, LoginLocation } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  location?: LoginLocation;
}

export interface PublicSignupPayload {
  fullName: string;
  businessName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface SetupSuperAdminPayload {
  setupKey: string;
  fullName: string;
  email: string;
  password: string;
  mobile: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface CreateAgentPayload {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  status: "ACTIVE" | "SUSPENDED";
}

export const authApi = {
  login: (payload: LoginPayload) =>
    request<{ user: User; token: string }>(apiClient.post("/auth/login", payload)),
  register: (payload: PublicSignupPayload) =>
    request<{ user: User; token: string }>(apiClient.post("/auth/register", payload)),
  superAdminLogin: (payload: LoginPayload) =>
    request<{ user: User; token: string }>(apiClient.post("/auth/superadmin", payload)),
  logout: () => request<{ success: boolean }>(apiClient.post("/auth/logout")),
  me: () => request<User>(apiClient.get("/auth/me")),
  updateProfile: (payload: Omit<Agent, "id" | "role" | "status" | "createdAt" | "updatedAt">) =>
    request<User>(apiClient.patch("/auth/profile", payload)),
  changePassword: (payload: ChangePasswordPayload) =>
    request<{ success: boolean }>(apiClient.post("/auth/change-password", payload)),
  setupSuperAdmin: (payload: SetupSuperAdminPayload) =>
    request<{ user: User; token: string }>(apiClient.post("/auth/setup-super-admin", payload)),
};
