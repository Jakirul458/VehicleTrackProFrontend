import axios, { AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Axios client for the external Node.js + Express + MongoDB backend.
 * Base URL always comes from the environment — never hardcode it.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env["VITE_API_URL"] ?? "http://localhost:5000/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export interface NormalizedApiError {
  status: number;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string> | undefined;
}

const STATUS_MESSAGE: Record<number, string> = {
  400: "Invalid request. Please check the details and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That record already exists.",
  422: "Some fields need attention.",
  429: "Too many attempts. Please wait a moment and retry.",
  500: "Something went wrong on the server. Please try again.",
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    typeof error.status === "number" &&
    typeof error.message === "string"
  ) {
    return error as NormalizedApiError;
  }
  const axiosError = error as AxiosError<{
    message?: string;
    code?: string;
    errors?: Record<string, string>;
  }>;
  if (axiosError?.isAxiosError) {
    const status = axiosError.response?.status ?? 0;
    return {
      status,
      message:
        axiosError.response?.data?.message ??
        STATUS_MESSAGE[status] ??
        (status === 0 ? "Cannot reach the server. Check your connection." : "Unexpected error."),
      ...(axiosError.response?.data?.code ? { code: axiosError.response.data.code } : {}),
      fieldErrors: axiosError.response?.data?.errors,
    };
  }
  return { status: 0, message: "Unexpected error." };
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error);
    if (normalized.code === "ACCOUNT_VALIDITY_EXPIRED") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!["/login", "/signup", "/register"].includes(window.location.pathname)) {
        window.location.assign("/login?expired=1");
      }
    } else if (
      normalized.status !== 401 &&
      !["/auth/login", "/auth/register"].includes(error.config?.url ?? "")
    ) {
      toast.error(normalized.message);
    }
    return Promise.reject(normalized);
  },
);

/** Unwraps `{ success, data }` envelopes returned by the backend. */
export async function request<T>(promise: Promise<{ data: unknown }>): Promise<T> {
  const response = await promise;
  const body = response.data as { data?: T } | T;
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  from?: string;
  to?: string;
  agentId?: string;
}

/** Standard CRUD service factory for every resource collection. */
export function createResourceApi<T, TPayload = Partial<T>>(resource: string) {
  return {
    resource,
    list: (params?: ListParams) => request<T[]>(apiClient.get(`/${resource}`, { params })),
    get: (id: string) => request<T>(apiClient.get(`/${resource}/${id}`)),
    create: (payload: TPayload) => request<T>(apiClient.post(`/${resource}`, payload)),
    update: (id: string, payload: TPayload) =>
      request<T>(apiClient.put(`/${resource}/${id}`, payload)),
    /** Backend performs a soft delete; records remain restorable by an admin. */
    remove: (id: string) => request<{ id: string }>(apiClient.delete(`/${resource}/${id}`)),
    restore: (id: string) => request<T>(apiClient.patch(`/${resource}/${id}/restore`)),
    markReminderDone: (id: string) => request<T>(apiClient.patch(`/${resource}/${id}/reminder`)),
  };
}
