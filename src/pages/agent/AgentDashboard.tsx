// import { useQuery } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
// import { AlertTriangle, CheckCircle, Clock, FileWarning, ShieldCheck, Receipt, FileText } from "lucide-react";
// import { reportApi } from "@/api";
// import type { AgentDashboardStats } from "@/types";
// import { DASHBOARD_STATUS, StatusBadge } from "@/components/common";

// const modules = [
//   {
//     key: "insurance",
//     title: "Insurance",
//     icon: ShieldCheck,
//     records: [
//       { label: "Active", status: "ACTIVE", count: "activeInsurance" },
//       { label: "Due", status: "DUE", count: "insuranceDue" },
//       { label: "Soon", status: "SOON", count: "insuranceSoon" },
//       { label: "Urgent", status: "URGENT", count: "insuranceUrgent" },
//       { label: "Expired", status: "EXPIRED", count: "expiredInsurance" },
//     ],
//   },
//   {
//     key: "tax",
//     title: "Tax",
//     icon: Receipt,
//     records: [
//       { label: "Active", status: "ACTIVE", count: "activeTax" },
//       { label: "Due", status: "DUE", count: "taxDue" },
//       { label: "Soon", status: "SOON", count: "taxSoon" },
//       { label: "Urgent", status: "URGENT", count: "taxUrgent" },
//       { label: "Expired", status: "EXPIRED", count: "expiredTax" },
//     ],
//   },
//   {
//     key: "puc",
//     title: "PUC",
//     icon: FileText,
//     records: [
//       { label: "Active", status: "ACTIVE", count: "activePuc" },
//       { label: "Due", status: "DUE", count: "pucDue" },
//       { label: "Soon", status: "SOON", count: "pucSoon" },
//       { label: "Urgent", status: "URGENT", count: "pucUrgent" },
//       { label: "Expired", status: "EXPIRED", count: "expiredPuc" },
//     ],
//   },
// ] as const;

// const statusIcons = {
//   ACTIVE: CheckCircle,
//   DUE: Clock,
//   SOON: Clock,
//   URGENT: AlertTriangle,
//   EXPIRED: FileWarning,
// } as const;

// export default function AgentDashboard() {
//   const { data: stats, isLoading, isError } = useQuery<AgentDashboardStats>({
//     queryKey: ["agent-dashboard"],
//     queryFn: reportApi.agentDashboard,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//   });

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
//       <p className="mb-8 text-sm text-muted-foreground">Select a status to open the matching customer and document records.</p>
//       {isError && <p className="mb-5 text-sm text-destructive">Dashboard data could not be loaded. Please refresh or check the API connection.</p>}
//       <div className="space-y-8">
//         {modules.map((module) => {
//           const ModuleIcon = module.icon;
//           return (
//             <section key={module.key}>
//               <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
//                 <ModuleIcon className="size-5 text-primary" />
//                 {module.title}
//               </h2>
//               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
//                 {module.records.map((record) => {
//                   const Icon = statusIcons[record.status];
//                   const count = stats?.[record.count as keyof AgentDashboardStats];
//                   return (
//                     <Link
//                       key={record.status}
//                       to={`/agent/${module.key}?status=${record.status}`}
//                       className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                     >
//                       <div className="mb-3 flex items-center justify-between gap-2">
//                         <StatusBadge status={DASHBOARD_STATUS[record.status].status} label={record.label} />
//                         <Icon className={`size-4 ${DASHBOARD_STATUS[record.status].textClass}`} />
//                       </div>
//                       <p className={`text-2xl font-bold ${DASHBOARD_STATUS[record.status].textClass}`}>
//                         {isLoading ? "…" : typeof count === "number" ? count : 0}
//                       </p>
//                       <span className="sr-only">Open {module.title} {record.label.toLowerCase()} records</span>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </section>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileWarning,
  ShieldCheck,
  Receipt,
  FileText,
} from "lucide-react";
import { reportApi } from "@/api";
import type { AgentDashboardStats } from "@/types";
import { DASHBOARD_STATUS, StatusBadge } from "@/components/common";
import { useAuth } from "@/context/AuthContext";

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

/**
 * Status-wise colour theme.
 * ACTIVE = green, DUE = blue, SOON = amber, URGENT = orange, EXPIRED = red
 */
const statusTheme = {
  ACTIVE: {
    card: "border-green-500/30 bg-gradient-to-br from-green-500/10 via-card to-card hover:border-green-500 hover:shadow-green-500/20",
    text: "text-green-600 dark:text-green-400",
    iconWrap: "bg-green-500/15 text-green-600 dark:text-green-400",
    glow: "bg-green-500",
    bar: "bg-green-500",
  },
  DUE: {
    card: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-card hover:border-blue-500 hover:shadow-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    iconWrap: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    glow: "bg-blue-500",
    bar: "bg-blue-500",
  },
  SOON: {
    card: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card hover:border-amber-500 hover:shadow-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    iconWrap: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500",
    bar: "bg-amber-500",
  },
  URGENT: {
    card: "border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-card to-card hover:border-orange-500 hover:shadow-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    iconWrap: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    glow: "bg-orange-500",
    bar: "bg-orange-500",
  },
  EXPIRED: {
    card: "border-red-500/30 bg-gradient-to-br from-red-500/10 via-card to-card hover:border-red-500 hover:shadow-red-500/20",
    text: "text-red-600 dark:text-red-400",
    iconWrap: "bg-red-500/15 text-red-600 dark:text-red-400",
    glow: "bg-red-500",
    bar: "bg-red-500",
  },
} as const;

/** Module-wise accent for section heading */
const moduleTheme = {
  insurance: "from-sky-500/15 text-sky-600 dark:text-sky-400",
  tax: "from-violet-500/15 text-violet-600 dark:text-violet-400",
  puc: "from-emerald-500/15 text-emerald-600 dark:text-emerald-400",
} as const;

const dashboardStyles = `
@keyframes dash-fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dash-blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30px, -20px) scale(1.1); }
  66%      { transform: translate(-20px, 20px) scale(0.95); }
}
@keyframes dash-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
  70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
@keyframes dash-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.dash-fade-up { animation: dash-fade-up 0.5s ease-out both; }
.dash-blob    { animation: dash-blob 14s ease-in-out infinite; }
.dash-pulse   { animation: dash-pulse-ring 2s infinite; }
.dash-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
  background-size: 200% 100%;
  animation: dash-shimmer 1.4s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .dash-fade-up, .dash-blob, .dash-pulse, .dash-shimmer { animation: none !important; }
}
`;

export default function AgentDashboard() {
  const { user } = useAuth();
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<AgentDashboardStats>({
    queryKey: ["agent-dashboard"],
    queryFn: reportApi.agentDashboard,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return (
    <div className="relative isolate overflow-hidden rounded-2xl p-1">
      <style>{dashboardStyles}</style>

      {/* Animated background theme */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="dash-blob pointer-events-none absolute -left-24 -top-24 -z-10 size-72 rounded-full bg-green-500/15 blur-3xl" />
      <div
        className="dash-blob pointer-events-none absolute -right-24 top-1/3 -z-10 size-80 rounded-full bg-blue-500/15 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="dash-blob pointer-events-none absolute -bottom-24 left-1/3 -z-10 size-72 rounded-full bg-red-500/10 blur-3xl"
        style={{ animationDelay: "-9s" }}
      />

      <h1 className="dash-fade-up mb-2 bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-3xl font-bold text-transparent">
        Dashboard
      </h1>
      <p
        className="dash-fade-up mb-8 text-sm text-muted-foreground"
        style={{ animationDelay: "80ms" }}
      >
        Select a status to open the matching document records.
      </p>

      {isError && (
        <p className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Dashboard data could not be loaded. Please refresh or check the API connection.
        </p>
      )}

      <div className="space-y-8">
        {modules
          .filter((module) => user?.moduleAccess?.[module.key] ?? true)
          .map((module, moduleIndex) => {
            const ModuleIcon = module.icon;
            const mTheme = moduleTheme[module.key];
            return (
              <section
                key={module.key}
                className="dash-fade-up"
                style={{ animationDelay: `${160 + moduleIndex * 120}ms` }}
              >
                <h2
                  className={`mb-3 flex items-center gap-2 rounded-lg bg-gradient-to-r ${mTheme} to-transparent px-3 py-2 text-lg font-semibold`}
                >
                  <ModuleIcon className="size-5" />
                  {module.title}
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {module.records.map((record, recordIndex) => {
                    const Icon = statusIcons[record.status];
                    const theme = statusTheme[record.status];
                    const count = stats?.[record.count as keyof AgentDashboardStats];
                    const numericCount = typeof count === "number" ? count : 0;
                    const isAlert = record.status === "EXPIRED" && numericCount > 0;

                    return (
                      <Link
                        key={record.status}
                        to={`/agent/${module.key}?status=${record.status}`}
                        className={`dash-fade-up group relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${theme.card} ${isAlert ? "dash-pulse" : ""}`}
                        style={{
                          animationDelay: `${260 + moduleIndex * 120 + recordIndex * 60}ms`,
                        }}
                      >
                        {/* Corner glow */}
                        <span
                          className={`pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-50 ${theme.glow}`}
                        />
                        {/* Left accent bar */}
                        <span className={`absolute inset-y-0 left-0 w-1 ${theme.bar}`} />

                        <div className="relative mb-3 flex items-center justify-between gap-2">
                          <StatusBadge
                            status={DASHBOARD_STATUS[record.status].status}
                            label={record.label}
                          />
                          <span
                            className={`flex size-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 ${theme.iconWrap}`}
                          >
                            <Icon className="size-4" />
                          </span>
                        </div>

                        <p className={`relative text-3xl font-bold tabular-nums ${theme.text}`}>
                          {isLoading ? (
                            <span className="relative inline-block h-8 w-10 overflow-hidden rounded bg-muted">
                              <span className="dash-shimmer absolute inset-0" />
                            </span>
                          ) : (
                            numericCount
                          )}
                        </p>
                        <span className="sr-only">
                          Open {module.title} {record.label.toLowerCase()} records
                        </span>
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
