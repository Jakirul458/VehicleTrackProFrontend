// import { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { Check, Download, MessageCircle, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { DataTable, downloadCsv, PageHeader, Panel, StatusBadge, type Column } from "@/components/common";
// import { daysLeft, formatCurrency, formatDate, formatDaysLeft } from "@/lib/expiry";
// import { MODULES, type ModuleDef, type Row } from "./modules";
// import { useAuth } from "@/context/AuthContext";

// type StatusFilter = "ALL" | "ACTIVE" | "DUE" | "SOON" | "URGENT" | "EXPIRED";
// type RecordStatus = Exclude<StatusFilter, "ALL"> | "INCOMPLETE";
// const STATUSES: StatusFilter[] = ["ALL", "ACTIVE", "DUE", "SOON", "URGENT", "EXPIRED"];

// function recordStatus(expiry?: string): RecordStatus {
//   const remaining = daysLeft(expiry);
//   if (remaining === null) return "INCOMPLETE";
//   if (remaining <= 0) return "EXPIRED";
//   if (remaining <= 7) return "URGENT";
//   if (remaining <= 30) return "SOON";
//   if (remaining <= 60) return "DUE";
//   return "ACTIVE";
// }

// function statusLabel(status: RecordStatus): string {
//   if (status === "INCOMPLETE") return "Not set";
//   if (status === "DUE" || status === "SOON") return "Due soon";
//   return status.charAt(0) + status.slice(1).toLowerCase();
// }

// function reminderMessage(moduleKey: ModuleDef["key"], row: Row, agentName: string, agentBusiness: string, agentMobile: string) {
//   const vehicle = String(row["vehicleNumber"] || "আপনার গাড়ি");
//   const expiry = row["expiryDate"]
//     ? new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(String(row["expiryDate"])))
//     : "শীঘ্রই";
//   const greeting = "নমস্কার, 🙏";
//   const signature = `${agentBusiness || agentName || "আপনার এজেন্ট"}${agentMobile ? `\nমোবাইল: ${agentMobile}` : ""}`;

//   if (moduleKey === "insurance") {
//     return `${greeting}\n\nআমি ${agentBusiness || agentName || "RIMON VEHICLE POINT"} থেকে বলছি।\n\nআপনার গাড়ি ${vehicle}-এর ইনস্যুরেন্সের মেয়াদ ${expiry} তারিখে শেষ হতে চলেছে।\n\nসময়মতো ইনস্যুরেন্স নবীকরণ করে নিন, যাতে মেয়াদ উত্তীর্ণ হওয়ার কারণে সমস্যায় পড়তে না হয়।\n\nইনস্যুরেন্স রিনিউ করার জন্য যোগাযোগ করুন। জরিমানা এড়াতে এখনই যোগাযোগ করুন।\n\n${signature}`;
//   }
//   if (moduleKey === "tax") {
//     return `${greeting}\n\nআমি ${agentBusiness || agentName || "RIMON VEHICLE POINT"} থেকে বলছি।\n\nআপনার গাড়ি ${vehicle}-এর রোড ট্যাক্সের মেয়াদ ${expiry} তারিখে শেষ হতে চলেছে।\n\nসময়মতো রোড ট্যাক্স পরিশোধ/নবীকরণ করে নিন, যাতে মেয়াদ উত্তীর্ণ হওয়ার কারণে জরিমানা বা সমস্যায় পড়তে না হয়।\n\nরোড ট্যাক্সের জন্য এখনই যোগাযোগ করুন।\n\n${signature}`;
//   }
//   return `${greeting}\n\nআমি ${agentBusiness || agentName || "RIMON VEHICLE POINT"} থেকে বলছি।\n\nআপনার গাড়ি ${vehicle}-এর PUC সার্টিফিকেটের মেয়াদ ${expiry} তারিখে শেষ হতে চলেছে।\n\nসময়মতো পলিউশন পরীক্ষা করিয়ে PUC নবীকরণ করে নিন, যাতে মেয়াদ উত্তীর্ণ সার্টিফিকেটের কারণে সমস্যায় পড়তে না হয়।\n\nPUC রিনিউ করার জন্য এখনই যোগাযোগ করুন।\n\n${signature}`;
// }

// function validStatus(value: string | null): value is StatusFilter {
//   return STATUSES.includes(value as StatusFilter);
// }

// function getInitialStatus(search: string): StatusFilter {
//   const value = new URLSearchParams(search).get("status");
//   return validStatus(value) ? value : "ALL";
// }

// function getColumns(def: ModuleDef): Column<Row>[] {
//   return def.columns.map((column) => ({
//     key: column.key,
//     header: column.header,
//     render: (row) => {
//       if (column.key === "daysLeft") return formatDaysLeft(row["expiryDate"] as string | undefined);
//       if (column.key === "status") {
//         const status = recordStatus(row["expiryDate"] as string | undefined);
//         const badgeStatus = status === "DUE" || status === "SOON" ? "DUE_SOON" : status;
//         return <StatusBadge status={badgeStatus} label={statusLabel(status)} />;
//       }
//       if (column.render) return column.render(row);
//       const value = row[column.key];
//       return value === undefined || value === null || value === "" ? "—" : String(value);
//     },
//   }));
// }

// function csvValue(def: ModuleDef, row: Row, key: string): string | number {
//   if (key === "daysLeft") return formatDaysLeft(row["expiryDate"] as string | undefined);
//   if (key === "status") return statusLabel(recordStatus(row["expiryDate"] as string | undefined));
//   const column = def.columns.find((item) => item.key === key);
//   if (column?.render) {
//     const rendered = column.render(row);
//     if (typeof rendered === "string" || typeof rendered === "number") return rendered;
//   }
//   const value = row[key];
//   if (key === "startDate" || key === "expiryDate") return formatDate(value as string | undefined);
//   if (typeof value === "number" && ["premium", "portalPaid", "customerPaid", "commission", "amount"].includes(key)) {
//     return formatCurrency(value);
//   }
//   return typeof value === "string" || typeof value === "number" ? value : "";
// }

// export function DocumentModulePage({
//   moduleKey,
//   admin = false,
//   agentId,
// }: {
//   moduleKey: ModuleDef["key"];
//   admin?: boolean;
//   agentId?: string;
// }) {
//   const def = MODULES[moduleKey];
//   const location = useLocation();
//   const { user } = useAuth();
//   const [rows, setRows] = useState<Row[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState<StatusFilter>(() => getInitialStatus(location.search));
//   const [editing, setEditing] = useState<Row | "new" | null>(null);
//   const [deleting, setDeleting] = useState<Row | null>(null);

//   useEffect(() => {
//     setStatus(getInitialStatus(location.search));
//   }, [location.search]);

//   useEffect(() => {
//     let active = true;
//     setLoading(true);
//     void def.api.list(agentId ? { agentId } : undefined).then((records) => {
//       if (active) setRows(records);
//     }).catch(() => {
//       if (active) setRows([]);
//     }).finally(() => {
//       if (active) setLoading(false);
//     });
//     return () => { active = false; };
//   }, [def, agentId]);

//   const filtered = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     return rows.filter((row) => {
//       if (status !== "ALL" && recordStatus(row["expiryDate"] as string | undefined) !== status) return false;
//       return !query || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query));
//     });
//   }, [rows, search, status]);

//   const current = editing && editing !== "new" ? editing : null;

//   async function save(form: FormData) {
//     const values: Record<string, unknown> = {};
//     for (const field of def.fields) {
//       const raw = form.get(field.name);
//       if (raw === null || String(raw).trim() === "") continue;
//       const value = String(raw).trim();
//       if (field.type === "number") {
//         const number = Number(value);
//         if (!Number.isFinite(number) || number < 0) {
//           toast.error(`${field.label} must be a valid non-negative number.`);
//           return;
//         }
//         values[field.name] = number;
//       } else {
//         values[field.name] = value;
//       }
//     }

//     try {
//       if (editing === "new") {
//         const created = await def.api.create(values as Partial<Row>);
//         setRows((previous) => [created, ...previous]);
//         toast.success(`${def.singular} added.`);
//       } else if (editing) {
//         const updated = await def.api.update(editing.id, values as Partial<Row>);
//         setRows((previous) => previous.map((row) => (row.id === editing.id ? updated : row)));
//         toast.success(`${def.singular} updated.`);
//       }
//       setEditing(null);
//     } catch {
//       return;
//     }
//   }

//   const columns = getColumns(def);
//   const exportRows = filtered.map((row) =>
//     Object.fromEntries(def.columns.map((column) => [column.header, csvValue(def, row, column.key)])),
//   );

//   return (
//     <>
//       <PageHeader
//         title={def.title}
//         description={admin ? `${def.description} ${agentId ? "Read-only agent records." : "Read-only records across all agents."}` : def.description}
//         actions={
//           <>
//             <Button variant="outline" onClick={() => downloadCsv(`${def.key}.csv`, exportRows)}>
//               <Download className="size-4" /> Export
//             </Button>
//             {!admin && (
//               <Button onClick={() => setEditing("new")}>
//                 <Plus className="size-4" /> Add {def.singular}
//               </Button>
//             )}
//           </>
//         }
//       />
//       <Panel>
//         <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//           <div className="relative md:w-80">
//             <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               className="pl-9"
//               placeholder={`Search ${def.title.toLowerCase()}…`}
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//             />
//           </div>
//           <div className="flex flex-wrap gap-1.5">
//             {STATUSES.map((item) => (
//               <button
//                 key={item}
//                 type="button"
//                 onClick={() => setStatus(item)}
//                 className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
//                   status === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
//                 }`}
//               >
//                 {item === "ALL" ? "All" : item === "DUE" ? "Due" : item === "SOON" ? "Soon" : statusLabel(item)}
//               </button>
//             ))}
//           </div>
//         </div>
//         <DataTable
//           columns={columns}
//           rows={filtered}
//           actions={
//             admin
//               ? undefined
//               : (row) => (
//                   <div className="flex justify-end gap-1">
//                     <Button size="icon" variant="ghost" aria-label={`Call ${String(row["customerName"] || "customer")}`} asChild>
//                       <a href={row["mobile"] ? `tel:${String(row["mobile"]).replace(/[^\d+]/g, "")}` : undefined}>
//                         <Phone className="size-4" />
//                       </a>
//                     </Button>
//                     <Button size="icon" variant="ghost" aria-label={`WhatsApp reminder for ${String(row["customerName"] || "customer")}`} asChild>
//                       <a
//                         href={row["mobile"] ? `https://wa.me/${String(row["mobile"]).replace(/\D/g, "").replace(/^0/, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(reminderMessage(moduleKey, row, user?.fullName ?? "", user?.businessName ?? "", user?.mobile ?? ""))}` : undefined}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-emerald-600"
//                       >
//                         <MessageCircle className="size-4" />
//                       </a>
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant={row["reminderDoneAt"] ? "secondary" : "outline"}
//                       disabled={Boolean(row["reminderDoneAt"])}
//                       aria-label={`Mark ${def.singular} reminder done`}
//                       onClick={() => {
//                         void def.api.markReminderDone(row.id).then((updated) => {
//                           setRows((previous) => previous.map((item) => item.id === updated.id ? updated : item));
//                           toast.success("Reminder marked as handled.");
//                         }).catch(() => undefined);
//                       }}
//                     >
//                       <Check className="size-4" /> {row["reminderDoneAt"] ? "Done" : "Mark done"}
//                     </Button>
//                     <Button size="icon" variant="ghost" aria-label={`Edit ${def.singular}`} onClick={() => setEditing(row)}>
//                       <Pencil className="size-4" />
//                     </Button>
//                     <Button size="icon" variant="ghost" aria-label={`Delete ${def.singular}`} onClick={() => setDeleting(row)}>
//                       <Trash2 className="size-4 text-destructive" />
//                     </Button>
//                   </div>
//                 )
//           }
//         />
//         <p className="mt-4 text-xs text-muted-foreground">
//           {loading ? "Loading records…" : `Showing ${filtered.length} of ${rows.length} records`}
//         </p>
//       </Panel>

//       <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
//         <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{current ? `Edit ${def.singular}` : `Add ${def.singular}`}</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={(event) => {
//             event.preventDefault();
//             void save(new FormData(event.currentTarget));
//           }}>
//             <div className="grid gap-4 sm:grid-cols-2">
//               {def.fields.map((field) => {
//                 const raw = current?.[field.name];
//                 const value = field.type === "date" && raw
//                   ? String(raw).slice(0, 10)
//                   : raw === undefined || raw === null ? "" : String(raw);
//                 return (
//                   <div key={field.name} className="space-y-1.5">
//                     <Label htmlFor={field.name}>{field.label}</Label>
//                     {field.type === "select" ? (
//                       <select
//                         id={field.name}
//                         name={field.name}
//                         defaultValue={value}
//                         className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
//                       >
//                         <option value="">Select {field.label.toLowerCase()}</option>
//                         {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
//                       </select>
//                     ) : (
//                       <Input
//                         id={field.name}
//                         name={field.name}
//                         type={field.type}
//                         min={field.type === "number" ? 0 : undefined}
//                         step={field.type === "number" ? "0.01" : undefined}
//                         defaultValue={value}
//                       />
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//             <DialogFooter className="mt-6">
//               <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
//               <Button type="submit" disabled={loading}>Save</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this record?</AlertDialogTitle>
//             <AlertDialogDescription>
//               The record for {String(deleting?.["customerName"] || deleting?.["vehicleNumber"] || "this vehicle")} will be moved to trash.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => {
//               if (!deleting) return;
//               void def.api.remove(deleting.id).then(() => {
//                 setRows((previous) => previous.filter((row) => row.id !== deleting.id));
//                 toast.success("Record deleted.");
//                 setDeleting(null);
//               }).catch(() => undefined);
//             }}>
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }














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
import { DataTable, downloadCsv, PageHeader, Panel, type Column } from "@/components/common";
import { daysLeft, formatCurrency, formatDate, formatDaysLeft } from "@/lib/expiry";
import { MODULES, type ModuleDef, type Row } from "./modules";
import { useAuth } from "@/context/AuthContext";

type StatusFilter = "ALL" | "ACTIVE" | "DUE" | "SOON" | "URGENT" | "EXPIRED";
type RecordStatus = Exclude<StatusFilter, "ALL"> | "INCOMPLETE";
const STATUSES: StatusFilter[] = ["ALL", "ACTIVE", "DUE", "SOON", "URGENT", "EXPIRED"];

/**
 * Status-wise colours.
 * ACTIVE = green, DUE = blue, SOON = amber, URGENT = orange, EXPIRED = red
 */
const STATUS_STYLE: Record<
  RecordStatus | "ALL",
  { pill: string; dot: string; text: string; chipActive: string; chipIdle: string; card: string; bar: string }
> = {
  ALL: {
    pill: "bg-primary/10 text-primary ring-primary/20",
    dot: "bg-primary",
    text: "text-primary",
    chipActive: "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
    chipIdle: "bg-primary/10 text-primary hover:bg-primary/20",
    card: "border-primary/30 from-primary/10 hover:border-primary",
    bar: "bg-primary",
  },
  ACTIVE: {
    pill: "bg-green-500/10 text-green-700 ring-green-500/30 dark:text-green-400",
    dot: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
    chipActive: "bg-green-600 text-white shadow-sm shadow-green-500/30",
    chipIdle: "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400",
    card: "border-green-500/30 from-green-500/10 hover:border-green-500",
    bar: "bg-green-500",
  },
  DUE: {
    pill: "bg-blue-500/10 text-blue-700 ring-blue-500/30 dark:text-blue-400",
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    chipActive: "bg-blue-600 text-white shadow-sm shadow-blue-500/30",
    chipIdle: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400",
    card: "border-blue-500/30 from-blue-500/10 hover:border-blue-500",
    bar: "bg-blue-500",
  },
  SOON: {
    pill: "bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-400",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    chipActive: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
    chipIdle: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400",
    card: "border-amber-500/30 from-amber-500/10 hover:border-amber-500",
    bar: "bg-amber-500",
  },
  URGENT: {
    pill: "bg-orange-500/10 text-orange-700 ring-orange-500/30 dark:text-orange-400",
    dot: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    chipActive: "bg-orange-600 text-white shadow-sm shadow-orange-500/30",
    chipIdle: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-400",
    card: "border-orange-500/30 from-orange-500/10 hover:border-orange-500",
    bar: "bg-orange-500",
  },
  EXPIRED: {
    pill: "bg-red-500/10 text-red-700 ring-red-500/30 dark:text-red-400",
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    chipActive: "bg-red-600 text-white shadow-sm shadow-red-500/30",
    chipIdle: "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400",
    card: "border-red-500/30 from-red-500/10 hover:border-red-500",
    bar: "bg-red-500",
  },
  INCOMPLETE: {
    pill: "bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-400",
    dot: "bg-slate-400",
    text: "text-slate-500 dark:text-slate-400",
    chipActive: "bg-slate-600 text-white",
    chipIdle: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20",
    card: "border-slate-500/30 from-slate-500/10 hover:border-slate-500",
    bar: "bg-slate-400",
  },
};

const moduleStyles = `
@keyframes mod-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mod-pulse-dot {
  0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.55); }
  70%  { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
.mod-fade-up  { animation: mod-fade-up 0.45s ease-out both; }
.mod-pulse-dot { animation: mod-pulse-dot 1.8s infinite; }
@media (prefers-reduced-motion: reduce) {
  .mod-fade-up, .mod-pulse-dot { animation: none !important; }
}
`;

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

function filterLabel(item: StatusFilter): string {
  if (item === "ALL") return "All";
  if (item === "DUE") return "Due";
  if (item === "SOON") return "Soon";
  return statusLabel(item);
}

function StatusPill({ status }: { status: RecordStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.pill}`}>
      <span className={`size-1.5 rounded-full ${style.dot} ${status === "EXPIRED" ? "mod-pulse-dot" : ""}`} />
      {statusLabel(status)}
    </span>
  );
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
      const status = recordStatus(row["expiryDate"] as string | undefined);
      if (column.key === "daysLeft") {
        return (
          <span className={`font-semibold tabular-nums ${STATUS_STYLE[status].text}`}>
            {formatDaysLeft(row["expiryDate"] as string | undefined)}
          </span>
        );
      }
      if (column.key === "status") return <StatusPill status={status} />;
      if (column.key === "expiryDate") {
        const value = row[column.key];
        return (
          <span className={`font-medium ${STATUS_STYLE[status].text}`}>
            {column.render ? column.render(row) : value ? String(value) : "—"}
          </span>
        );
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

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { ALL: rows.length, ACTIVE: 0, DUE: 0, SOON: 0, URGENT: 0, EXPIRED: 0 };
    for (const row of rows) {
      const key = recordStatus(row["expiryDate"] as string | undefined);
      if (key !== "INCOMPLETE") result[key] += 1;
    }
    return result;
  }, [rows]);

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
      <style>{moduleStyles}</style>
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

      {/* Status summary cards (click to filter) */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUSES.map((item, index) => {
          const style = STATUS_STYLE[item];
          const selected = status === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`mod-fade-up group relative overflow-hidden rounded-xl border bg-gradient-to-br via-card to-card p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${style.card} ${selected ? "ring-2 ring-offset-1 ring-offset-background " + (item === "ALL" ? "ring-primary" : "ring-current " + style.text) : ""}`}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
              <span className={`block text-xs font-semibold uppercase tracking-wide ${style.text}`}>{filterLabel(item)}</span>
              <span className={`mt-1 block text-2xl font-bold tabular-nums ${style.text}`}>
                {loading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-muted" /> : counts[item]}
              </span>
            </button>
          );
        })}
      </div>

      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 focus-visible:ring-primary/40"
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                  status === item ? STATUS_STYLE[item].chipActive : STATUS_STYLE[item].chipIdle
                }`}
              >
                {filterLabel(item)}
                <span className="rounded-full bg-black/10 px-1.5 text-[10px] tabular-nums dark:bg-white/15">{counts[item]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm [&_table]:w-full [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-primary/5 [&_tbody_tr:nth-child(even)]:bg-muted/30 [&_thead]:bg-gradient-to-r [&_thead]:from-primary/10 [&_thead]:via-muted/60 [&_thead]:to-muted/30 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-foreground/70">
          <DataTable
            columns={columns}
            rows={filtered}
            actions={
              admin
                ? undefined
                : (row) => (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-sky-600 hover:bg-sky-500/10 hover:text-sky-600"
                        aria-label={`Call ${String(row["customerName"] || "customer")}`}
                        asChild
                      >
                        <a href={row["mobile"] ? `tel:${String(row["mobile"]).replace(/[^\d+]/g, "")}` : undefined}>
                          <Phone className="size-4" />
                        </a>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600"
                        aria-label={`WhatsApp reminder for ${String(row["customerName"] || "customer")}`}
                        asChild
                      >
                        <a
                          href={row["mobile"] ? `https://wa.me/${String(row["mobile"]).replace(/\D/g, "").replace(/^0/, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(reminderMessage(moduleKey, row, user?.fullName ?? "", user?.businessName ?? "", user?.mobile ?? ""))}` : undefined}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant={row["reminderDoneAt"] ? "secondary" : "outline"}
                        className={
                          row["reminderDoneAt"]
                            ? "bg-green-500/15 text-green-700 dark:text-green-400"
                            : "border-green-500/40 text-green-700 hover:bg-green-500/10 dark:text-green-400"
                        }
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-600"
                        aria-label={`Edit ${def.singular}`}
                        onClick={() => setEditing(row)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-red-500/10"
                        aria-label={`Delete ${def.singular}`}
                        onClick={() => setDeleting(row)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  )
            }
          />
        </div>
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
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleting) return;
                void def.api.remove(deleting.id).then(() => {
                  setRows((previous) => previous.filter((row) => row.id !== deleting.id));
                  toast.success("Record deleted.");
                  setDeleting(null);
                }).catch(() => undefined);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}