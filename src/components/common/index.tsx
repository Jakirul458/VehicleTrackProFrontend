import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/expiry";
import type { ExpiryStatus } from "@/types";

const STATUS_CLASS: Record<ExpiryStatus, string> = {
  ACTIVE: "bg-status-active-soft text-status-active",
  DUE_SOON: "bg-status-due-soft text-status-due",
  URGENT: "bg-status-urgent-soft text-status-urgent",
  EXPIRED: "bg-status-expired-soft text-status-expired",
  INCOMPLETE: "bg-status-incomplete-soft text-status-incomplete",
};

export const DASHBOARD_STATUS = {
  ACTIVE: { status: "ACTIVE", textClass: "text-status-active" },
  DUE: { status: "DUE_SOON", textClass: "text-status-due" },
  SOON: { status: "DUE_SOON", textClass: "text-status-due" },
  URGENT: { status: "URGENT", textClass: "text-status-urgent" },
  EXPIRED: { status: "EXPIRED", textClass: "text-status-expired" },
} satisfies Record<"ACTIVE" | "DUE" | "SOON" | "URGENT" | "EXPIRED", { status: ExpiryStatus; textClass: string }>;

export function StatusBadge({ status, label }: { status: ExpiryStatus; label?: string | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_CLASS[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "primary" | "active" | "due" | "urgent" | "expired" | "incomplete";
  hint?: string;
}) {
  const toneClass = {
    primary: "bg-accent text-accent-foreground",
    active: "bg-status-active-soft text-status-active",
    due: "bg-status-due-soft text-status-due",
    urgent: "bg-status-urgent-soft text-status-urgent",
    expired: "bg-status-expired-soft text-status-expired",
    incomplete: "bg-status-incomplete-soft text-status-incomplete",
  }[tone];
  const valueClass = {
    primary: "text-foreground",
    active: "text-status-active",
    due: "text-status-due",
    urgent: "text-status-urgent",
    expired: "text-status-expired",
    incomplete: "text-status-incomplete",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn("mt-2 font-display text-2xl font-bold", valueClass)}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("grid size-10 place-items-center rounded-lg", toneClass)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-6" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  actions,
  emptyTitle = "No records found",
}: {
  columns: Column<T>[];
  rows: T[];
  actions?: ((row: T) => ReactNode) | undefined;
  emptyTitle?: string;
}) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} description="Try adjusting your search or filters." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((c) => (
              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3 font-semibold", c.className)}>
                {c.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
              {columns.map((c) => (
                <td key={c.key} className={cn("whitespace-nowrap px-4 py-3", c.className)}>
                  {c.render(row)}
                </td>
              ))}
              {actions && <td className="whitespace-nowrap px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
