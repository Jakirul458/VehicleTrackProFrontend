import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { subscriptionAdminApi } from "@/api";
import { VehicleLoading } from "@/components/common/VehicleLoading";
import { createInvoicePdf, invoiceFilename } from "@/lib/invoice";
import { formatCurrency, formatDate } from "@/lib/expiry";
import type { SubscriptionPayment } from "@/types";

export default function AdminSubscriptionInvoices() {
  const [page, setPage] = useState(1);
  const invoicesQuery = useQuery({
    queryKey: ["admin-subscription-invoices", page],
    queryFn: () => subscriptionAdminApi.payments.list({ status: "APPROVED", page, limit: 20 }),
  });
  const result = invoicesQuery.data;

  async function downloadInvoice(invoice: SubscriptionPayment) {
    try {
      const detailedInvoice = await subscriptionAdminApi.payments.get(invoice.id);
      const pdf = await createInvoicePdf(detailedInvoice);
      pdf.save(invoiceFilename(detailedInvoice));
    } catch {
      toast.error("Invoice PDF could not be generated. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Subscription invoices</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track approved subscription invoices, billed agents, amounts, and validity.
        </p>
      </header>
      <div className="overflow-x-auto rounded-xl border bg-card">
        {invoicesQuery.isLoading ? (
          <VehicleLoading variant="section" />
        ) : invoicesQuery.isError ? (
          <p role="alert" className="p-6 text-destructive">
            Subscription invoice history could not be loaded.
          </p>
        ) : result?.data.length ? (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide">
                <th className="bg-slate-700 px-4 py-3 text-white">Invoice</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Agent</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Plan</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Amount</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Issued / validity</th>
                <th className="bg-slate-700 px-4 py-3 text-white">PDF</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((invoice) => {
                const agent = typeof invoice.agentId === "string" ? null : invoice.agentId;
                return (
                  <tr key={invoice.id} className="border-t align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="text-muted-foreground">
                        {invoice.gstEnabled ? `GST ${invoice.gstRate}%` : "GST not charged"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {agent ? (
                        <Link
                          to={`/admin/agents/${agent.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {agent.fullName}
                        </Link>
                      ) : (
                        invoice.customer.fullName
                      )}
                      <p className="text-muted-foreground">
                        {agent?.businessName || invoice.customer.businessName || ""}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold">{invoice.planName}</p>
                      <p className="text-muted-foreground">{invoice.planDescription}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {formatCurrency(invoice.totalAmount || invoice.amount)}
                      {invoice.gstEnabled && (
                        <p className="text-xs font-normal text-muted-foreground">
                          GST {formatCurrency(invoice.gstAmount)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p>{formatDate(invoice.approvedAt)}</p>
                      <p className="text-muted-foreground">
                        Through {formatDate(invoice.periodEnd)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void downloadInvoice(invoice)}
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold hover:bg-accent"
                      >
                        <Download className="size-4" /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No subscription invoices yet</p>
          </div>
        )}
        {result && result.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t p-3 text-sm">
            <span>
              Page {result.pagination.page} of {result.pagination.pages} · {result.pagination.total}{" "}
              invoices
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= result.pagination.pages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
