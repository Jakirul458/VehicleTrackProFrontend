import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Download, MessageCircle, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, downloadCsv, PageHeader, Panel, StatusBadge, type Column } from "@/components/common";
import { daysLeft, formatCurrency, formatDate, formatDaysLeft } from "@/lib/expiry";
import { MODULES, type ModuleDef, type Row } from "./modules";
import { useAuth } from "@/context/AuthContext";

type StatusFilter = "ALL" | "ACTIVE" | "DUE" | "SOON" | "URGENT" | "EXPIRED";
type RecordStatus = Exclude<StatusFilter, "ALL"> | "INCOMPLETE";
const STATUSES: StatusFilter[] = ["ALL", "ACTIVE", "DUE", "SOON", "URGENT", "EXPIRED"];

function recordStatus(expiry?: string): RecordStatus {
  const remaining = daysLeft(expiry);
  if (remaining === null) return "INCOMPLETE";
  if (remaining <= 0) return "EXPIRED";
  if (remaining <= 7) return "URGENT";
  if (remaining <= 30) return "SOON";
  if (remaining <= 60) return "DUE";
  return "ACTIVE";
}

function statusLabel(status: RecordStatus): string {
  if (status === "INCOMPLETE") return "Not set";
  if (status === "DUE" || status === "SOON") return "Due soon";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function reminderMessage(moduleKey: ModuleDef["key"], row: Row, agentName: string, agentBusiness: string, agentMobile: string) {
  const vehicle = String(row["vehicleNumber"] || "আপনার গাড়ি");
  const expiry = row["expiryDate"]
    ? new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(String(row["expiryDate"])))
    : "শীঘ্রই";
  const greeting = "নমস্কার, 🙏";
  const signature = `${agentBusiness || agentName || "আপনার এজেন্ট"}${agentMobile ? `\nমোবাইল: ${agentMobile}` : ""}`;

  if (moduleKey === "insurance") {
    return `${greeting}\n\nআমি ${agentBusiness || agentName || "RIMON VEHICLE POINT"} থেকে বলছি।\n\nআপনার গাড়ি ${vehicle}-এর ইনস্যুরেন্সের মেয়াদ ${expiry} তারিখে শেষ হতে চলেছে।\n\nসময়মতো ইনস্যুরেন্স নবীকরণ করে নিন, যাতে মেয়াদ উত্তীর্ণ হওয়ার কারণে সমস্যায় পড়তে না হয়।\n\nইনস্যুরেন্স রিনিউ করার জন্য যোগাযোগ করুন। জরিমানা এড়াতে এখনই যোগাযোগ করুন।\n\n${signature}`;
  }
  if (moduleKey === "tax") {
    return `${greeting}\n\nআমি ${agentBusiness || agentName || "RIMON VEHICLE POINT"} থেকে বলছি।\n\nআপনার গাড়ি ${vehicle}-এর রোড ট্যাক্সের মেয়াদ ${expiry} তারিখে শেষ হতে চলেছে।\n\nসময়মতো রোড ট্যাক্স পরিশোধ/নবীকরণ করে নিন, যাতে মেয়াদ উত্তীর্ণ হওয়ার কারণে জরিমানা বা সমস্যায় পড়তে না হয়।\n\nরোড ট্যাক্সের জন্য এখনই যোগাযোগ করুন।\n\n${signature}`;
  }
  return `${greeting}\n\nআমি ${agentBusiness || agentName || "RIMON VEHICLE POINT"} থেকে বলছি।\n\nআপনার গাড়ি ${vehicle}-এর PUC সার্টিফিকেটের মেয়াদ ${expiry} তারিখে শেষ হতে চলেছে।\n\nসময়মতো পলিউশন পরীক্ষা করিয়ে PUC নবীকরণ করে নিন, যাতে মেয়াদ উত্তীর্ণ সার্টিফিকেটের কারণে সমস্যায় পড়তে না হয়।\n\nPUC রিনিউ করার জন্য এখনই যোগাযোগ করুন।\n\n${signature}`;
}

function validStatus(value: string | null): value is StatusFilter {
  return STATUSES.includes(value as StatusFilter);
}

function getInitialStatus(search: string): StatusFilter {
  const value = new URLSearchParams(search).get("status");
  return validStatus(value) ? value : "ALL";
}

function getColumns(def: ModuleDef): Column<Row>[] {
  return def.columns.map((column) => ({
    key: column.key,
    header: column.header,
    render: (row) => {
      if (column.key === "daysLeft") return formatDaysLeft(row["expiryDate"] as string | undefined);
      if (column.key === "status") {
        const status = recordStatus(row["expiryDate"] as string | undefined);
        const badgeStatus = status === "DUE" || status === "SOON" ? "DUE_SOON" : status;
        return <StatusBadge status={badgeStatus} label={statusLabel(status)} />;
      }
      if (column.render) return column.render(row);
      const value = row[column.key];
      return value === undefined || value === null || value === "" ? "—" : String(value);
    },
  }));
}

function csvValue(def: ModuleDef, row: Row, key: string): string | number {
  if (key === "daysLeft") return formatDaysLeft(row["expiryDate"] as string | undefined);
  if (key === "status") return statusLabel(recordStatus(row["expiryDate"] as string | undefined));
  const column = def.columns.find((item) => item.key === key);
  if (column?.render) {
    const rendered = column.render(row);
    if (typeof rendered === "string" || typeof rendered === "number") return rendered;
  }
  const value = row[key];
  if (key === "startDate" || key === "expiryDate") return formatDate(value as string | undefined);
  if (typeof value === "number" && ["premium", "portalPaid", "customerPaid", "commission", "amount"].includes(key)) {
    return formatCurrency(value);
  }
  return typeof value === "string" || typeof value === "number" ? value : "";
}

export function DocumentModulePage({
  moduleKey,
  admin = false,
  agentId,
}: {
  moduleKey: ModuleDef["key"];
  admin?: boolean;
  agentId?: string;
}) {
  const def = MODULES[moduleKey];
  const location = useLocation();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(() => getInitialStatus(location.search));
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  useEffect(() => {
    setStatus(getInitialStatus(location.search));
  }, [location.search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void def.api.list(agentId ? { agentId } : undefined).then((records) => {
      if (active) setRows(records);
    }).catch(() => {
      if (active) setRows([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [def, agentId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "ALL" && recordStatus(row["expiryDate"] as string | undefined) !== status) return false;
      return !query || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query));
    });
  }, [rows, search, status]);

  const current = editing && editing !== "new" ? editing : null;

  async function save(form: FormData) {
    const values: Record<string, unknown> = {};
    for (const field of def.fields) {
      const raw = form.get(field.name);
      if (raw === null || String(raw).trim() === "") continue;
      const value = String(raw).trim();
      if (field.type === "number") {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) {
          toast.error(`${field.label} must be a valid non-negative number.`);
          return;
        }
        values[field.name] = number;
      } else {
        values[field.name] = value;
      }
    }

    try {
      if (editing === "new") {
        const created = await def.api.create(values as Partial<Row>);
        setRows((previous) => [created, ...previous]);
        toast.success(`${def.singular} added.`);
      } else if (editing) {
        const updated = await def.api.update(editing.id, values as Partial<Row>);
        setRows((previous) => previous.map((row) => (row.id === editing.id ? updated : row)));
        toast.success(`${def.singular} updated.`);
      }
      setEditing(null);
    } catch {
      return;
    }
  }

  const columns = getColumns(def);
  const exportRows = filtered.map((row) =>
    Object.fromEntries(def.columns.map((column) => [column.header, csvValue(def, row, column.key)])),
  );

  return (
    <>
      <PageHeader
        title={def.title}
        description={admin ? `${def.description} ${agentId ? "Read-only agent records." : "Read-only records across all agents."}` : def.description}
        actions={
          <>
            <Button variant="outline" onClick={() => downloadCsv(`${def.key}.csv`, exportRows)}>
              <Download className="size-4" /> Export
            </Button>
            {!admin && (
              <Button onClick={() => setEditing("new")}>
                <Plus className="size-4" /> Add {def.singular}
              </Button>
            )}
          </>
        }
      />
      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={`Search ${def.title.toLowerCase()}…`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  status === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {item === "ALL" ? "All" : item === "DUE" ? "Due" : item === "SOON" ? "Soon" : statusLabel(item)}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          actions={
            admin
              ? undefined
              : (row) => (
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Call ${String(row["customerName"] || "customer")}`} asChild>
                      <a href={row["mobile"] ? `tel:${String(row["mobile"]).replace(/[^\d+]/g, "")}` : undefined}>
                        <Phone className="size-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`WhatsApp reminder for ${String(row["customerName"] || "customer")}`} asChild>
                      <a
                        href={row["mobile"] ? `https://wa.me/${String(row["mobile"]).replace(/\D/g, "").replace(/^0/, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(reminderMessage(moduleKey, row, user?.fullName ?? "", user?.businessName ?? "", user?.mobile ?? ""))}` : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600"
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant={row["reminderDoneAt"] ? "secondary" : "outline"}
                      disabled={Boolean(row["reminderDoneAt"])}
                      aria-label={`Mark ${def.singular} reminder done`}
                      onClick={() => {
                        void def.api.markReminderDone(row.id).then((updated) => {
                          setRows((previous) => previous.map((item) => item.id === updated.id ? updated : item));
                          toast.success("Reminder marked as handled.");
                        }).catch(() => undefined);
                      }}
                    >
                      <Check className="size-4" /> {row["reminderDoneAt"] ? "Done" : "Mark done"}
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`Edit ${def.singular}`} onClick={() => setEditing(row)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${def.singular}`} onClick={() => setDeleting(row)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )
          }
        />
        <p className="mt-4 text-xs text-muted-foreground">
          {loading ? "Loading records…" : `Showing ${filtered.length} of ${rows.length} records`}
        </p>
      </Panel>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{current ? `Edit ${def.singular}` : `Add ${def.singular}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(event) => {
            event.preventDefault();
            void save(new FormData(event.currentTarget));
          }}>
            <div className="grid gap-4 sm:grid-cols-2">
              {def.fields.map((field) => {
                const raw = current?.[field.name];
                const value = field.type === "date" && raw
                  ? String(raw).slice(0, 10)
                  : raw === undefined || raw === null ? "" : String(raw);
                return (
                  <div key={field.name} className="space-y-1.5">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        defaultValue={value}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select {field.label.toLowerCase()}</option>
                        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? "0.01" : undefined}
                        defaultValue={value}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              The record for {String(deleting?.["customerName"] || deleting?.["vehicleNumber"] || "this vehicle")} will be moved to trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleting) return;
              void def.api.remove(deleting.id).then(() => {
                setRows((previous) => previous.filter((row) => row.id !== deleting.id));
                toast.success("Record deleted.");
                setDeleting(null);
              }).catch(() => undefined);
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
