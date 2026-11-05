import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeApiError } from "@/api/client";
import { subscriptionAdminApi } from "@/api";
import { VehicleLoading } from "@/components/common/VehicleLoading";
import { InvoiceEditDialog } from "@/components/subscriptions/InvoiceEditDialog";
import { createInvoicePdf, invoiceFilename, previewInvoicePdf } from "@/lib/invoice";
import { formatCurrency, formatDate } from "@/lib/expiry";
import type { SubscriptionInvoiceUpdate, SubscriptionPayment } from "@/types";

export default function AdminSubscriptionInvoices() {
  const [page, setPage] = useState(1);
  const [editingInvoice, setEditingInvoice] = useState<SubscriptionPayment | null>(null);
  const queryClient = useQueryClient();
  const invoicesQuery = useQuery({
    queryKey: ["admin-subscription-invoices", page],
    queryFn: () => subscriptionAdminApi.payments.list({ status: "APPROVED", page, limit: 20 }),
  });
  const result = invoicesQuery.data;
  const updateInvoice = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubscriptionInvoiceUpdate }) =>
      subscriptionAdminApi.payments.updateInvoice(id, payload),
    onSuccess: async () => {
      setEditingInvoice(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-subscription-invoices"] });
      toast.success("Invoice updated.");
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  });
  const deleteInvoice = useMutation({
    mutationFn: subscriptionAdminApi.payments.deleteInvoice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-subscription-invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      toast.success("Invoice deleted.");
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  });

  async function downloadInvoice(invoice: SubscriptionPayment) {
    try {
      const detailedInvoice = await subscriptionAdminApi.payments.get(invoice.id);
      const pdf = await createInvoicePdf(detailedInvoice);
      pdf.save(invoiceFilename(detailedInvoice));
    } catch {
      toast.error("Invoice PDF could not be generated. Please try again.");
    }
  }

  async function viewInvoice(invoice: SubscriptionPayment) {
    try {
      await previewInvoicePdf(async () => {
        const detailedInvoice = await subscriptionAdminApi.payments.get(invoice.id);
        return createInvoicePdf(detailedInvoice);
      });
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.startsWith("Allow pop-ups")
          ? error.message
          : "Invoice PDF could not be opened. Please try again.",
      );
    }
  }

  function confirmDelete(invoice: SubscriptionPayment) {
    if (
      window.confirm(
        "Delete this invoice from the invoice list? This voids the invoice but does not change the agent's subscription validity.",
      )
    ) {
      deleteInvoice.mutate(invoice.id);
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
                <th className="bg-slate-700 px-4 py-3 text-white">Actions</th>
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void viewInvoice(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-semibold hover:bg-accent"
                        >
                          <Eye className="size-4" /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => void downloadInvoice(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-semibold hover:bg-accent"
                        >
                          <Download className="size-4" /> Download
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingInvoice(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-semibold hover:bg-accent"
                        >
                          <Pencil className="size-4" /> Edit
                        </button>
                        <button
                          type="button"
                          disabled={deleteInvoice.isPending}
                          onClick={() => confirmDelete(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          <Trash2 className="size-4" /> Delete
                        </button>
                      </div>
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
      {editingInvoice && (
        <InvoiceEditDialog
          invoice={editingInvoice}
          saving={updateInvoice.isPending}
          onClose={() => setEditingInvoice(null)}
          onSave={(payload) => updateInvoice.mutate({ id: editingInvoice.id, payload })}
        />
      )}
    </div>
  );
}
