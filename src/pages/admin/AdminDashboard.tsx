import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, FileWarning, Receipt, ShieldCheck, FileText, Users } from "lucide-react";
import { reportApi } from "@/api";
import type { DashboardStats } from "@/types";
import { DASHBOARD_STATUS, StatusBadge } from "@/components/common";

const modules = [
  {
    key: "insurance",
    title: "Insurance",
    icon: ShieldCheck,
    records: [
      { label: "Active", status: "ACTIVE", count: "activeInsurance" },
      { label: "Due", status: "DUE", count: "insuranceDue" },
      { label: "Soon", status: "SOON", count: "insuranceSoon" },
      { label: "Urgent", status: "URGENT", count: "insuranceUrgent" },
      { label: "Expired", status: "EXPIRED", count: "expiredInsurance" },
    ],
  },
  {
    key: "tax",
    title: "Tax",
    icon: Receipt,
    records: [
      { label: "Active", status: "ACTIVE", count: "activeTax" },
      { label: "Due", status: "DUE", count: "taxDue" },
      { label: "Soon", status: "SOON", count: "taxSoon" },
      { label: "Urgent", status: "URGENT", count: "taxUrgent" },
      { label: "Expired", status: "EXPIRED", count: "expiredTax" },
    ],
  },
  {
    key: "puc",
    title: "PUC",
    icon: FileText,
    records: [
      { label: "Active", status: "ACTIVE", count: "activePuc" },
      { label: "Due", status: "DUE", count: "pucDue" },
      { label: "Soon", status: "SOON", count: "pucSoon" },
      { label: "Urgent", status: "URGENT", count: "pucUrgent" },
      { label: "Expired", status: "EXPIRED", count: "expiredPuc" },
    ],
  },
] as const;

const statusIcons = {
  ACTIVE: CheckCircle,
  DUE: Clock,
  SOON: Clock,
  URGENT: AlertTriangle,
  EXPIRED: FileWarning,
} as const;

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["admin-document-dashboard"],
    queryFn: reportApi.adminDashboard,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
      <p className="mb-8 text-sm text-muted-foreground">Platform-wide document expiry overview. Select a status to see matching records.</p>
      {isError && <p className="mb-5 text-sm text-destructive">Dashboard data could not be loaded. Please refresh or check the API connection.</p>}
      <div className="mb-8 rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-primary" />
          <span className="text-sm text-muted-foreground">Total agents</span>
          <span className="ml-auto text-2xl font-bold">{isLoading ? "…" : stats?.totalAgents ?? 0}</span>
        </div>
      </div>
      <div className="space-y-8">
        {modules.map((module) => {
          const ModuleIcon = module.icon;
          return (
            <section key={module.key}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <ModuleIcon className="size-5 text-primary" />
                {module.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {module.records.map((record) => {
                  const Icon = statusIcons[record.status];
                  const count = stats?.[record.count as keyof DashboardStats];
                  return (
                    <Link
                      key={record.status}
                      to={`/admin/${module.key}?status=${record.status}`}
                      className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <StatusBadge status={DASHBOARD_STATUS[record.status].status} label={record.label} />
                        <Icon className={`size-4 ${DASHBOARD_STATUS[record.status].textClass}`} />
                      </div>
                      <p className={`text-2xl font-bold ${DASHBOARD_STATUS[record.status].textClass}`}>
                        {isLoading ? "…" : typeof count === "number" ? count : 0}
                      </p>
                      <span className="sr-only">Open {module.title} {record.label.toLowerCase()} records</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
