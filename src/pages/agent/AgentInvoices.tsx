import { useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { paymentApi } from "@/api";
import { VehicleLoading } from "@/components/common/VehicleLoading";
import { createInvoicePdf, invoiceFilename, previewInvoicePdf } from "@/lib/invoice";
import { formatCurrency, formatDate } from "@/lib/expiry";
import type { SubscriptionPayment } from "@/types";

export default function AgentInvoices() {
  const invoicesQuery = useQuery({
    queryKey: ["my-subscription-payments"],
    queryFn: paymentApi.mine,
  });
  const invoices = invoicesQuery.data?.filter((item) => item.status === "APPROVED") ?? [];

  async function downloadInvoice(invoice: SubscriptionPayment) {
    try {
      const detailedInvoice = await paymentApi.invoice(invoice.id);
      const pdf = await createInvoicePdf(detailedInvoice);
      pdf.save(invoiceFilename(detailedInvoice));
    } catch {
      toast.error("Invoice PDF could not be generated. Please try again.");
    }
  }

  async function viewInvoice(invoice: SubscriptionPayment) {
    try {
      await previewInvoicePdf(async () => {
        const detailedInvoice = await paymentApi.invoice(invoice.id);
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">My subscription invoices</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Download receipts for approved subscription payments. Invoices show the plan and customer
          details captured when payment was verified.
        </p>
      </header>
      {invoicesQuery.isLoading ? (
        <div className="rounded-lg border bg-card">
          <VehicleLoading variant="section" />
        </div>
      ) : invoicesQuery.isError ? (
        <p role="alert" className="rounded-lg border bg-card p-6 text-destructive">
          Invoice history could not be loaded. Refresh and try again.
        </p>
      ) : invoices.length ? (
        <div className="divide-y rounded-xl border bg-card">
          {invoices.map((invoice) => (
            <article
              key={invoice.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold">{invoice.planName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {invoice.invoiceNumber} · Issued {formatDate(invoice.approvedAt)}
                  </p>
                  <p className="mt-1 text-sm">
                    {formatCurrency(invoice.totalAmount || invoice.amount)}
                    {invoice.gstEnabled ? ` (GST ${invoice.gstRate}%)` : " · GST not charged"}
                    {invoice.periodEnd ? ` · Valid through ${formatDate(invoice.periodEnd)}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void viewInvoice(invoice)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold hover:bg-accent"
                >
                  <Eye className="size-4" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => void downloadInvoice(invoice)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
                >
                  <Download className="size-4" />
                  Download
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-8 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No invoices yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            An invoice will appear here after your subscription payment is approved.
          </p>
        </div>
      )}
    </div>
  );
}
