import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Search, Wallet } from "lucide-react";
import { reportApi } from "@/api";
import { normalizeApiError } from "@/api/client";
import {
  DataTable,
  downloadCsv,
  PageHeader,
  Panel,
  StatCard,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/expiry";
import { useAuth } from "@/context/AuthContext";
import type { PaymentAgent, PaymentRecord } from "@/types";

type Period = "monthly" | "yearly" | "all";
type PaymentKind = "All" | PaymentRecord["type"];

interface AgentPaymentSummary extends PaymentAgent {
  business: number;
  documentAmount: number;
  portalPaid: number;
  commission: number;
  profit: number;
  records: number;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "all", label: "All time" },
];

const PAYMENT_KINDS: PaymentKind[] = ["All", "Insurance", "Tax", "PUC"];
const PAYMENT_KIND_STYLE: Record<PaymentKind, { selected: string; badge: string }> = {
  All: {
    selected: "border-slate-500 bg-slate-600 text-white",
    badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
  Insurance: {
    selected: "border-sky-600 bg-sky-600 text-white",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  Tax: {
    selected: "border-violet-600 bg-violet-600 text-white",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  PUC: {
    selected: "border-emerald-600 bg-emerald-600 text-white",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
};

function getColumns(isAdmin: boolean): Column<PaymentRecord>[] {
  return [
    {
      key: "paymentDate",
      header: "Payment date",
      headerClassName: "bg-slate-700 text-white",
      className: "bg-slate-500/5",
      render: (row) => formatDate(row.paymentDate),
    },
    {
      key: "type",
      header: "Type",
      headerClassName: "bg-indigo-700 text-white",
      className: "bg-indigo-500/5",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_KIND_STYLE[row.type].badge}`}
        >
          {row.type}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "agentName",
            header: "Agent",
            headerClassName: "bg-slate-700 text-white",
            className: "bg-slate-500/5",
            render: (row: PaymentRecord) => row.agentName || "—",
          },
        ]
      : []),
    {
      key: "customer",
      header: "Customer / Vehicle",
      headerClassName: "bg-cyan-700 text-white",
      className: "bg-cyan-500/5",
      render: (row) => (
        <div className="min-w-36">
          <p className="font-medium">{row.customerName || "—"}</p>
          <p className="text-xs text-muted-foreground">{row.vehicleNumber || "—"}</p>
        </div>
      ),
    },
    {
      key: "documentAmount",
      header: "Premium",
      headerClassName: "bg-blue-700 text-white",
      className: "bg-blue-500/5 text-right",
      render: (row) => formatCurrency(row.documentAmount),
    },
    {
      key: "customerPaid",
      header: "Customer paid",
      headerClassName: "bg-emerald-700 text-white",
      className: "bg-emerald-500/5 text-right",
      render: (row) => formatCurrency(row.customerPaid),
    },
    {
      key: "portalPaid",
      header: "Paid to portal",
      headerClassName: "bg-sky-700 text-white",
      className: "bg-sky-500/5 text-right",
      render: (row) => formatCurrency(row.portalPaid),
    },
    {
      key: "commission",
      header: "Commission",
      headerClassName: "bg-violet-700 text-white",
      className: "bg-violet-500/5 text-right",
      render: (row) => formatCurrency(row.commission),
    },
    {
      key: "profit",
      header: "Profit",
      headerClassName: "bg-green-700 text-white",
      className: "bg-green-500/5 text-right font-semibold",
      render: (row) => formatCurrency(row.profit),
    },
  ];
}

function isInPeriod(paymentDate: string, period: Period, now: Date): boolean {
  if (period === "all") return true;
  const date = new Date(paymentDate);
  if (Number.isNaN(date.getTime())) return false;
  return period === "monthly"
    ? date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    : date.getFullYear() === now.getFullYear();
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN";
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [agents, setAgents] = useState<PaymentAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("monthly");
  const [kind, setKind] = useState<PaymentKind>("All");
  const [search, setSearch] = useState("");
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void reportApi
      .payments()
      .then((data) => {
        if (active) {
          setRecords(data.records);
          setAgents(data.agents);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(normalizeApiError(cause).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const periodAndKindRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          isInPeriod(record.paymentDate, period, now) && (kind === "All" || record.type === kind),
      ),
    [records, period, kind, now],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return periodAndKindRecords.filter((record) => {
      if (!query) return true;
      return [
        record.type,
        isAdmin ? record.agentName : "",
        record.customerName,
        record.mobile,
        record.vehicleNumber,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [periodAndKindRecords, search, isAdmin]);

  const totals = useMemo(
    () =>
      periodAndKindRecords.reduce(
        (summary, row) => ({
          documentAmount: summary.documentAmount + row.documentAmount,
          customerPaid: summary.customerPaid + row.customerPaid,
          portalPaid: summary.portalPaid + row.portalPaid,
          commission: summary.commission + row.commission,
          profit: summary.profit + row.profit,
        }),
        { documentAmount: 0, customerPaid: 0, portalPaid: 0, commission: 0, profit: 0 },
      ),
    [periodAndKindRecords],
  );

  const agentSummaries = useMemo<AgentPaymentSummary[]>(() => {
    const summaries = new Map(
      agents.map((agent) => [
        agent.id,
        {
          ...agent,
          business: 0,
          documentAmount: 0,
          portalPaid: 0,
          commission: 0,
          profit: 0,
          records: 0,
        },
      ]),
    );
    for (const record of periodAndKindRecords) {
      const summary = summaries.get(record.agentId);
      if (!summary) continue;
      summary.business += record.customerPaid;
      summary.documentAmount += record.documentAmount;
      summary.portalPaid += record.portalPaid;
      summary.commission += record.commission;
      summary.profit += record.profit;
      summary.records += 1;
    }
    return Array.from(summaries.values()).sort((a, b) => b.business - a.business);
  }, [agents, periodAndKindRecords]);

  const exportRows = filtered.map((row) => ({
    "Payment date": formatDate(row.paymentDate),
    Type: row.type,
    ...(isAdmin ? { Agent: row.agentName ?? "" } : {}),
    Customer: row.customerName ?? "",
    Mobile: row.mobile ?? "",
    Vehicle: row.vehicleNumber ?? "",
    Premium: row.documentAmount,
    "Customer paid": row.customerPaid,
    "Paid to portal": row.portalPaid,
    Commission: row.commission,
    Profit: row.profit,
  }));

  return (
    <>
      <PageHeader
        title="Payments"
        description="Insurance, Tax and PUC payment records and accounting."
        actions={
          <Button
            variant="outline"
            disabled={filtered.length === 0}
            onClick={() => downloadCsv(`payments-${period}.csv`, exportRows)}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Payment period">
        {PERIODS.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={period === item.value ? "default" : "outline"}
            aria-pressed={period === item.value}
            onClick={() => setPeriod(item.value)}
          >
            {item.value === "monthly" && <CalendarDays className="size-4" />}
            {item.value === "yearly" && <CalendarDays className="size-4" />}
            {item.value === "all" && <Wallet className="size-4" />}
            {item.label}
          </Button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Payment type">
        {PAYMENT_KINDS.map((item) => {
          const count =
            item === "All"
              ? records.filter((record) => isInPeriod(record.paymentDate, period, now)).length
              : records.filter(
                  (record) => record.type === item && isInPeriod(record.paymentDate, period, now),
                ).length;
          const selected = kind === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setKind(item)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? PAYMENT_KIND_STYLE[item].selected
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item}
              <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Payment records could not be loaded: {error}
        </p>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Premium"
          value={loading ? "…" : formatCurrency(totals.documentAmount)}
          icon={Wallet}
        />
        <StatCard
          label={isAdmin ? "Total business (customer payments)" : "Collected from customers"}
          value={loading ? "…" : formatCurrency(totals.customerPaid)}
          icon={Wallet}
          tone="active"
        />
        <StatCard
          label="Paid to portal"
          value={loading ? "…" : formatCurrency(totals.portalPaid)}
          icon={Wallet}
          tone="due"
        />
        <StatCard
          label="Commission earned"
          value={loading ? "…" : formatCurrency(totals.commission)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Profit"
          value={loading ? "…" : formatCurrency(totals.profit)}
          icon={Wallet}
          tone="active"
          hint="Insurance: Customer paid + Commission − Portal paid · Tax/PUC: Customer paid − Portal paid"
        />
      </div>

      {isAdmin && (
        <Panel
          title="Agent-wise business"
          description="Customer payments received by each agent for the selected period and payment type."
          className="mb-5"
        >
          <div className="overflow-hidden rounded-xl border [&_table]:min-w-[700px] [&_thead]:bg-muted/60 [&_tbody_tr:nth-child(even)]:bg-muted/20 [&_tbody_tr:hover]:bg-primary/5">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading agent totals…</p>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "name",
                    header: "Agent",
                    headerClassName: "bg-slate-700 text-white",
                    className: "bg-slate-500/5",
                    render: (row) => row.name,
                  },
                  {
                    key: "business",
                    header: "Business",
                    headerClassName: "bg-emerald-700 text-white",
                    className: "bg-emerald-500/5 text-right",
                    render: (row) => formatCurrency(row.business),
                  },
                  {
                    key: "documentAmount",
                    header: "Premium",
                    headerClassName: "bg-blue-700 text-white",
                    className: "bg-blue-500/5 text-right",
                    render: (row) => formatCurrency(row.documentAmount),
                  },
                  {
                    key: "portalPaid",
                    header: "Paid to portal",
                    headerClassName: "bg-sky-700 text-white",
                    className: "bg-sky-500/5 text-right",
                    render: (row) => formatCurrency(row.portalPaid),
                  },
                  {
                    key: "commission",
                    header: "Commission",
                    headerClassName: "bg-violet-700 text-white",
                    className: "bg-violet-500/5 text-right",
                    render: (row) => formatCurrency(row.commission),
                  },
                  {
                    key: "profit",
                    header: "Profit",
                    headerClassName: "bg-green-700 text-white",
                    className: "bg-green-500/5 text-right font-semibold",
                    render: (row) => formatCurrency(row.profit),
                  },
                  {
                    key: "records",
                    header: "Records",
                    headerClassName: "bg-amber-700 text-white",
                    className: "bg-amber-500/5 text-right",
                    render: (row) => row.records.toLocaleString("en-IN"),
                  },
                ]}
                rows={agentSummaries}
                emptyTitle="No agents found"
              />
            )}
          </div>
        </Panel>
      )}

      <Panel
        title={`${kind === "All" ? "All" : kind} · ${PERIODS.find((item) => item.value === period)?.label} payments`}
        description={`${filtered.length} payment ${filtered.length === 1 ? "record" : "records"}${search.trim() ? " matching your search" : ""}`}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={
                isAdmin
                  ? "Search agent, customer, vehicle or type"
                  : "Search customer, vehicle or type"
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {period !== "all" && (
            <p className="text-sm text-muted-foreground">
              {period === "monthly"
                ? now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                : now.getFullYear()}
            </p>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border [&_table]:min-w-[900px] [&_thead]:bg-muted/60 [&_tbody_tr:nth-child(even)]:bg-muted/20 [&_tbody_tr:hover]:bg-primary/5">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading payment records…</p>
          ) : (
            <DataTable
              columns={getColumns(isAdmin)}
              rows={filtered}
              emptyTitle="No payments found"
            />
          )}
        </div>
      </Panel>
    </>
  );
}
