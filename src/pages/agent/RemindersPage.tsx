import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BellRing, MessageCircle, Phone } from "lucide-react";
import { remindersApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Panel } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import type { ExpiryReminder, ReminderType } from "@/types";

interface ReminderRow {
  id: string;
  customerName: string;
  mobile: string;
  vehicleNumber: string;
  insurance?: ExpiryReminder;
  tax?: ExpiryReminder;
  puc?: ExpiryReminder;
}

const DOCUMENT_LABELS: Record<ReminderType, string> = {
  insurance: "Insurance (Days left)",
  tax: "Road Tax (Days left)",
  puc: "PUC (Days left)",
};

function formatExpiryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "শীঘ্রই";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDaysLeft(value: number) {
  if (value < 0) return `${Math.abs(value)} days overdue`;
  if (value === 0) return "Expires today";
  return `${value} days left`;
}

function whatsappNumber(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10) digits = `91${digits}`;
  else if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  return /^\d{10,15}$/.test(digits) ? digits : null;
}

function makeMessage(
  reminder: ExpiryReminder,
  row: ReminderRow,
  agentName: string,
  businessName: string,
  agentMobile: string,
) {
  const business = businessName || agentName || "আপনার এজেন্ট";
  const customer = row.customerName === "Name not provided" ? "গ্রাহক" : row.customerName;
  const vehicle = row.vehicleNumber || "আপনার গাড়ি";
  const expiry = formatExpiryDate(reminder.expiryDate);
  const contact = agentMobile ? `📞 যোগাযোগ: ${agentMobile}` : "";
  const signature = [contact, business].filter(Boolean).join("\n");

  if (reminder.type === "insurance") {
    return `⚠️ INSURANCE RENEWAL ALERT

Hello ${customer}!

আপনার গাড়ি ${vehicle}-এর ইনস্যুরেন্সের মেয়াদ ${expiry} তারিখে শেষ হচ্ছে। জরিমানা ও আইনি সমস্যা এড়াতে মেয়াদ শেষ হওয়ার আগেই সাশ্রয়ী মূল্যে রিনিউ করুন।

${signature}`;
  }

  if (reminder.type === "tax") {
    return `⚠️ TAX RENEWAL ALERT

Hello ${customer}!

আপনার গাড়ি ${vehicle}-এর রোড ট্যাক্স জমা দেওয়ার মেয়াদ ${expiry} তারিখে শেষ হচ্ছে। জরিমানা ও আইনি সমস্যা এড়াতে মেয়াদ শেষ হওয়ার আগেই সাশ্রয়ী মূল্যে রোড ট্যাক্স জমা করুন।

${signature}`;
  }

  return `⚠️ PUC RENEWAL ALERT

Hello ${customer}!

আপনার গাড়ি ${vehicle}-এর PUC সার্টিফিকেটের মেয়াদ ${expiry} তারিখে শেষ হচ্ছে। জরিমানা ও আইনি সমস্যা এড়াতে মেয়াদ শেষ হওয়ার আগেই সাশ্রয়ী মূল্যে PUC রিনিউ করুন।

${signature}`;
}

function reminderRows(items: ExpiryReminder[]) {
  const grouped = new Map<string, ReminderRow>();
  for (const reminder of items) {
    const mobile = reminder.mobile ?? "";
    const vehicleNumber = reminder.vehicleNumber ?? "";
    const key =
      mobile && vehicleNumber
        ? `${mobile.toLowerCase()}|${vehicleNumber.toLowerCase()}`
        : `${reminder.type}:${reminder.id}`;
    let row = grouped.get(key);
    if (!row) {
      row = {
        id: key,
        customerName: reminder.customerName || "Name not provided",
        mobile,
        vehicleNumber,
      };
      grouped.set(key, row);
    }
    const current = row[reminder.type];
    if (!current || reminder.daysLeft < current.daysLeft) {
      row[reminder.type] = reminder;
    }
  }
  return [...grouped.values()].sort((left, right) => {
    const leftDue = Math.min(
      ...[left.insurance, left.tax, left.puc].filter(Boolean).map((item) => item!.daysLeft),
    );
    const rightDue = Math.min(
      ...[right.insurance, right.tax, right.puc].filter(Boolean).map((item) => item!.daysLeft),
    );
    return leftDue - rightDue;
  });
}

function DaysLeftCell({
  reminder,
  row,
  agentName,
  businessName,
  agentMobile,
}: {
  reminder?: ExpiryReminder;
  row: ReminderRow;
  agentName: string;
  businessName: string;
  agentMobile: string;
}) {
  if (!reminder) return <span className="text-muted-foreground">—</span>;
  const phone = whatsappNumber(row.mobile);
  const message = makeMessage(reminder, row, agentName, businessName, agentMobile);
  const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : undefined;
  const overdue = reminder.daysLeft <= 0;

  return (
    <div className="flex min-w-36 flex-col items-start gap-2">
      <Badge variant={overdue ? "destructive" : "secondary"}>
        {formatDaysLeft(reminder.daysLeft)}
      </Badge>
      <Button
        size="sm"
        variant="outline"
        className="h-8 border-green-600/30 px-2 text-green-700 hover:bg-green-600/10 hover:text-green-700 dark:text-green-400"
        disabled={!href}
        asChild={Boolean(href)}
      >
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        ) : (
          <>
            <MessageCircle className="size-4" />
            WhatsApp
          </>
        )}
      </Button>
    </div>
  );
}

export default function RemindersPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["agent-reminders"],
    queryFn: remindersApi.list,
  });
  const rows = useMemo(() => reminderRows(data?.items ?? []), [data?.items]);

  return (
    <>
      <PageHeader
        title="Reminders"
        description={`Customers whose insurance, road tax, or PUC expires within ${data?.warningDays ?? 7} days or has already expired.`}
      />
      <Panel>
        {isLoading ? (
          <div className="space-y-3" aria-label="Loading reminders">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-10 text-center">
            <p className="text-sm text-destructive">Could not load reminders. Please try again.</p>
            <Button className="mt-3" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <BellRing className="size-8 text-muted-foreground" />
            <p className="font-medium">No reminders right now</p>
            <p className="text-sm text-muted-foreground">
              Documents expiring within the next {data?.warningDays ?? 7} days will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer name</th>
                  <th className="px-4 py-3 font-semibold">Mobile</th>
                  <th className="px-4 py-3 font-semibold">Vehicle number</th>
                  {(Object.keys(DOCUMENT_LABELS) as ReminderType[]).map((type) => (
                    <th key={type} className="px-4 py-3 font-semibold">
                      {DOCUMENT_LABELS[type]}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Call</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{row.customerName}</td>
                    <td className="px-4 py-3">{row.mobile || "—"}</td>
                    <td className="px-4 py-3">{row.vehicleNumber || "—"}</td>
                    <td className="px-4 py-3">
                      <DaysLeftCell
                        reminder={row.insurance}
                        row={row}
                        agentName={user?.fullName ?? ""}
                        businessName={user?.businessName ?? ""}
                        agentMobile={user?.mobile ?? ""}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DaysLeftCell
                        reminder={row.tax}
                        row={row}
                        agentName={user?.fullName ?? ""}
                        businessName={user?.businessName ?? ""}
                        agentMobile={user?.mobile ?? ""}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DaysLeftCell
                        reminder={row.puc}
                        row={row}
                        agentName={user?.fullName ?? ""}
                        businessName={user?.businessName ?? ""}
                        agentMobile={user?.mobile ?? ""}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.mobile ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                          aria-label={`Call ${row.customerName}`}
                        >
                          <a href={`tel:${row.mobile.replace(/[^\d+]/g, "")}`}>
                            <Phone className="size-4" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled
                          aria-label="Mobile number unavailable"
                        >
                          <Phone className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
