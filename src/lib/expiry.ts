import type { ExpiryStatus } from "@/types";

/** Days remaining until an expiry date (negative when already expired). */
export function daysLeft(expiryDate?: string | null): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / 86_400_000);
}

/**
 * Status is always derived from the expiry date — never stored in state.
 * ACTIVE > 30d · DUE_SOON 11-30d · URGENT 1-10d · EXPIRED <= 0 · INCOMPLETE missing data.
 */
export function getExpiryStatus(expiryDate?: string | null, complete = true): ExpiryStatus {
  const days = daysLeft(expiryDate);
  if (!complete || days === null) return "INCOMPLETE";
  if (days <= 0) return "EXPIRED";
  if (days <= 10) return "URGENT";
  if (days <= 30) return "DUE_SOON";
  return "ACTIVE";
}

export const STATUS_LABEL: Record<ExpiryStatus, string> = {
  ACTIVE: "Active",
  DUE_SOON: "Due Soon",
  URGENT: "Urgent",
  EXPIRED: "Expired",
  INCOMPLETE: "Incomplete",
};

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDaysLeft(expiryDate?: string | null): string {
  const days = daysLeft(expiryDate);
  if (days === null) return "—";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  return `${days}d`;
}
