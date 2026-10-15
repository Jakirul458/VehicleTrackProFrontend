import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, FileWarning, Plus, Receipt, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { customerApi, insuranceApi, reportApi, taxApi } from "@/api";
import { DataTable, EmptyState, PageHeader, Panel, StatCard, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatDaysLeft, getExpiryStatus } from "@/lib/expiry";
import { useAuth } from "@/lib/auth";
import type { AdminDashboardStats, Customer, DashboardStats, Insurance, Tax } from "@/types";

type CustomerDocument = {
  id: string;
  module: "Insurance" | "Tax";
  vehicleNumber: string;
  expiryDate: string;
};

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative mb-4 md:w-80">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-9" placeholder="Search customers…" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function DashboardPage({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const request = admin ? reportApi.adminDashboard() : reportApi.agentDashboard();
    void request.then((result) => {
      if (active) setStats(result);
    }).catch(() => {
      if (active) setStats(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [admin]);

  const value = (count: number | undefined) => count ?? (loading ? "…" : 0);

  return (
    <>
      <PageHeader
        title={admin ? "Platform overview" : `Welcome back, ${user?.fullName.split(" ")[0] ?? ""}`}
        description="Customer, insurance, tax, and expiry data from your workspace."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {admin && stats && "totalAgents" in stats && <StatCard label="Agents" value={stats.totalAgents} icon={Users} hint={`${stats.activeAgents} active`} />}
        <StatCard label="Customers" value={value(stats?.totalCustomers)} icon={Users} />
        <StatCard label="Insurance policies" value={value(stats?.insurance)} icon={ShieldCheck} />
        <StatCard label="Tax records" value={value(stats?.tax)} icon={Receipt} />
        <StatCard label="Active records" value={value(stats?.active)} icon={CheckCircle2} tone="active" />
        <StatCard label="Due soon" value={value(stats?.dueSoon)} icon={Clock} tone="due" />
        <StatCard label="Urgent" value={value(stats?.urgent)} icon={AlertTriangle} tone="urgent" />
        <StatCard label="Expired" value={value(stats?.expired)} icon={FileWarning} tone="expired" />
      </div>
      {!loading && !stats && <p className="mt-4 text-sm text-destructive">Dashboard data could not be loaded. Check the API connection and refresh.</p>}
    </>
  );
}

export function CustomersPage({ admin = false }: { admin?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void customerApi.list().then((records) => {
      if (active) setCustomers(records);
    }).catch(() => {
      if (active) setCustomers([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = customers.filter((customer) =>
    [customer.name, customer.mobile, customer.address].some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description={admin ? "Customers across all agent accounts." : "Customers linked to your insurance and tax records."}
        actions={!admin && <Button onClick={() => setDialogOpen(true)}><Plus className="size-4" /> Add customer</Button>}
      />
      <Panel>
        <SearchBox value={query} onChange={setQuery} />
        {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading customers…</p> : (
          <DataTable
            rows={filtered}
            emptyTitle="No customers found"
            columns={[
              { key: "name", header: "Customer", render: (customer) => admin ? customer.name : <Link to="/customers/$id" params={{ id: customer.id }} className="font-medium text-primary hover:underline">{customer.name}</Link> },
              { key: "mobile", header: "Mobile", render: (customer) => customer.mobile },
              { key: "address", header: "Address", render: (customer) => customer.address ?? "—" },
              { key: "insurance-tax", header: "Records", render: (customer) => customer.activeDocuments },
              { key: "due", header: "Due soon", render: (customer) => customer.dueSoon },
              { key: "expired", header: "Expired", render: (customer) => customer.expired },
              { key: "created", header: "Added", render: (customer) => formatDate(customer.createdAt) },
            ]}
          />
        )}
      </Panel>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add customer</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const name = String(form.get("name") ?? "").trim();
            const mobile = String(form.get("mobile") ?? "").trim();
            if (!name || !/^\+?[0-9]{10,15}$/.test(mobile)) {
              toast.error("Enter a name and valid mobile number");
              return;
            }
            try {
              const created = await customerApi.create({ name, mobile, address: String(form.get("address") ?? "") });
              setCustomers((current) => [{ ...created, vehicleCount: 0, activeDocuments: 0, dueSoon: 0, expired: 0 }, ...current]);
              toast.success("Customer added");
              setDialogOpen(false);
            } catch {
              return;
            }
          }}>
            <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>
            <div className="space-y-1.5"><Label htmlFor="mobile">Mobile</Label><Input id="mobile" name="mobile" inputMode="tel" maxLength={16} required /></div>
            <div className="space-y-1.5"><Label htmlFor="address">Address</Label><Input id="address" name="address" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save customer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CustomerDetailPage({ id }: { id: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      customerApi.get(id),
      insuranceApi.list({ customerId: id }),
      taxApi.list({ customerId: id }),
    ]).then(([record, policies, taxes]) => {
      if (!active) return;
      setCustomer(record);
      setDocuments([
        ...policies.map((policy: Insurance) => ({ id: policy.id, module: "Insurance" as const, vehicleNumber: policy.vehicleNumber, expiryDate: policy.expiryDate })),
        ...taxes.map((taxRecord: Tax) => ({ id: taxRecord.id, module: "Tax" as const, vehicleNumber: taxRecord.vehicleNumber, expiryDate: taxRecord.expiryDate })),
      ]);
    }).catch(() => {
      if (active) setCustomer(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (loading) return <EmptyState title="Loading customer…" />;
  if (!customer) return <EmptyState title="Customer not found" />;

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.createdAt)}`}
        actions={<Button variant="outline" asChild><Link to="/customers">Back to customers</Link></Button>}
      />
      <Panel title="Contact details">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">Mobile</dt><dd className="font-medium">{customer.mobile}</dd></div>
          <div><dt className="text-muted-foreground">Alternate mobile</dt><dd className="font-medium">{customer.altMobile ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground">Address</dt><dd className="font-medium">{customer.address ?? "—"}</dd></div>
        </dl>
      </Panel>
      <Panel title={`Insurance and tax (${documents.length})`} className="mt-6">
        <DataTable
          rows={documents}
          emptyTitle="No insurance or tax records linked"
          columns={[
            { key: "module", header: "Type", render: (document) => document.module },
            { key: "vehicle", header: "Vehicle", render: (document) => document.vehicleNumber },
            { key: "expiry", header: "Expiry", render: (document) => formatDate(document.expiryDate) },
            { key: "days", header: "Days left", render: (document) => formatDaysLeft(document.expiryDate) },
            { key: "status", header: "Status", render: (document) => <StatusBadge status={getExpiryStatus(document.expiryDate)} /> },
          ]}
        />
      </Panel>
    </>
  );
}
