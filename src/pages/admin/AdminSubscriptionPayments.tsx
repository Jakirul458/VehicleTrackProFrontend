import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { adminApi, subscriptionAdminApi } from "@/api";
import { normalizeApiError } from "@/api/client";
import { VehicleLoading } from "@/components/common/VehicleLoading";
import { daysLeft, formatCurrency, formatDate } from "@/lib/expiry";
import { createInvoicePdf, invoiceFilename } from "@/lib/invoice";
import type { SubscriptionPayment } from "@/types";
import { InvoiceDraftPreview } from "@/components/subscriptions/InvoiceDraftPreview";

function subscriptionLabel(status?: string) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid / Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Free";
  }
}

export default function AdminSubscriptionPayments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [freeDates, setFreeDates] = useState<Record<string, string>>({});
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [invoiceGstEnabled, setInvoiceGstEnabled] = useState(false);
  const [invoiceGstRate, setInvoiceGstRate] = useState(18);
  const [invoiceSellerGstin, setInvoiceSellerGstin] = useState("");
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["platform-settings"],
    queryFn: adminApi.settings.get,
  });
  const agentsQuery = useQuery({
    queryKey: ["agent-subscriptions", page, search],
    queryFn: () => subscriptionAdminApi.agents.list({ page, limit: 20, search }),
    staleTime: 0,
  });
  const detailQuery = useQuery({
    queryKey: ["admin-subscription-payment", selectedId],
    queryFn: () => subscriptionAdminApi.payments.get(selectedId),
    enabled: Boolean(selectedId),
  });
  const invalidateSubscriptions = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["agent-subscriptions"] }),
      queryClient.invalidateQueries({ queryKey: ["agents"] }),
      queryClient.invalidateQueries({ queryKey: ["agent"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payment"] }),
    ]);
  };
  const review = useMutation({
    mutationFn: (input: {
      id: string;
      payload:
        | {
            status: "APPROVED";
            gstEnabled?: boolean;
            gstRate?: number;
            sellerGstin?: string;
          }
        | { status: "REJECTED"; rejectReason: string };
    }) => subscriptionAdminApi.payments.review(input.id, input.payload),
    onSuccess: async (saved) => {
      await invalidateSubscriptions();
      setRejectReason("");
      toast.success(
        saved.status === "APPROVED" ? "Payment verified and invoice issued." : "Payment rejected.",
      );
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  });
  const setFreePlan = useMutation({
    mutationFn: (input: { agentId: string; date: string }) =>
      adminApi.agents.updateSubscription(input.agentId, "FREE", input.date),
    onSuccess: async () => {
      await invalidateSubscriptions();
      toast.success("Free plan and validity date saved.");
    },
    onError: () => toast.error("Free plan could not be assigned."),
  });
  const toggleAgent = useMutation({
    mutationFn: (input: { agentId: string; status: "ACTIVE" | "SUSPENDED" }) =>
      adminApi.agents.updateStatus(input.agentId, input.status),
    onSuccess: async (_agent, input) => {
      await invalidateSubscriptions();
      toast.success(`Agent ${input.status.toLowerCase()}.`);
    },
    onError: () => toast.error("Agent access could not be updated."),
  });

  const selected = detailQuery.data;
  useEffect(() => {
    if (!selected) return;
    setInvoiceGstEnabled(selected.gstEnabled ?? false);
    const savedGstRate = selected.gstRate ?? 0;
    setInvoiceGstRate(savedGstRate > 0 ? savedGstRate : (settingsQuery.data?.invoiceGstRate ?? 18));
    setInvoiceSellerGstin(selected.seller.gstin || settingsQuery.data?.businessGstin || "");
    setInvoicePreviewOpen(false);
  }, [selected, settingsQuery.data]);
  const previewGstAmount =
    selected && invoiceGstEnabled
      ? Math.round(selected.amount * (invoiceGstRate / 100) * 100) / 100
      : 0;
  const previewTotal = selected ? Math.round((selected.amount + previewGstAmount) * 100) / 100 : 0;
  const amountMatchesPayment =
    selected && previewTotal === (selected.totalAmount || selected.amount);

  async function downloadInvoice(payment: SubscriptionPayment) {
    try {
      const detailedInvoice = await subscriptionAdminApi.payments.get(payment.id);
      const pdf = await createInvoicePdf(detailedInvoice);
      pdf.save(invoiceFilename(detailedInvoice));
    } catch {
      toast.error("The invoice PDF could not be generated.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <div className="mb-3">
          <Link to="/admin/agents" className="text-sm font-semibold text-primary hover:underline">
            ← Agent directory
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Agent subscriptions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All agents, subscription status, payment verification, free access, validity, and account
          controls in one place.
        </p>
      </header>

      <label className="flex max-w-lg items-center gap-2 rounded-md border bg-card px-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search agent name, business, email, or phone"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>

      <div className="overflow-x-auto rounded-lg border bg-card">
        {agentsQuery.isLoading ? (
          <VehicleLoading variant="section" />
        ) : agentsQuery.isError ? (
          <p role="alert" className="p-6 text-destructive">
            Agents and subscription details could not be loaded.
          </p>
        ) : agentsQuery.data?.data.length ? (
          <table className="w-full min-w-[1250px] text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide">
                <th className="bg-slate-700 px-4 py-3 text-white">Agent</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Account</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Subscription</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Plan / validity</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Latest payment</th>
                <th className="bg-slate-700 px-4 py-3 text-white">Free plan / actions</th>
              </tr>
            </thead>
            <tbody>
              {agentsQuery.data.data.map((agent) => {
                const payment = agent.latestPayment;
                const expired = !agent.trialEndDate || (daysLeft(agent.trialEndDate) ?? -1) < 0;
                const paymentStatus = payment?.status;
                return (
                  <tr key={agent.id} className="border-t align-top">
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/agents/${agent.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {agent.fullName}
                      </Link>
                      <p className="mt-1 text-muted-foreground">{agent.businessName || "—"}</p>
                      <p className="mt-1 text-muted-foreground">{agent.email}</p>
                      <p className="text-muted-foreground">{agent.mobile}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          agent.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-amber-500/10 text-amber-700"
                        }`}
                      >
                        {agent.status}
                      </span>
                      <p
                        className={`mt-2 text-xs font-semibold ${expired ? "text-destructive" : "text-emerald-700"}`}
                      >
                        {expired ? "Validity expired" : "Access valid"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          agent.subscriptionStatus === "PAID"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : agent.subscriptionStatus === "PENDING"
                              ? "bg-amber-500/10 text-amber-700"
                              : agent.subscriptionStatus === "REJECTED"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-slate-500/10 text-slate-700"
                        }`}
                      >
                        {subscriptionLabel(agent.subscriptionStatus)}
                      </span>
                      {agent.subscriptionPlanName && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {agent.subscriptionPlanName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p>{agent.trialEndDate ? formatDate(agent.trialEndDate) : "Not set"}</p>
                      <label className="mt-3 block text-xs text-muted-foreground">
                        Free plan valid until
                        <input
                          type="date"
                          value={freeDates[agent.id] ?? ""}
                          onChange={(event) =>
                            setFreeDates((current) => ({
                              ...current,
                              [agent.id]: event.target.value,
                            }))
                          }
                          className="mt-1 block h-9 rounded-md border bg-background px-2 text-sm text-foreground"
                        />
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      {payment ? (
                        <>
                          <p className="font-semibold">
                            {payment.planName} · {formatCurrency(payment.totalAmount)}
                          </p>
                          <p className="mt-1">
                            {payment.paymentApp === "Admin verified"
                              ? "Admin-verified payment"
                              : `UTR: ${payment.utr}`}
                          </p>
                          <p className="text-muted-foreground">
                            {payment.paymentApp} · paid {formatDate(payment.paymentDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDate(payment.createdAt)} · {paymentStatus}
                          </p>
                          {paymentStatus === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => setSelectedId(payment.id)}
                              className="mt-2 rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                            >
                              Review payment
                            </button>
                          )}
                          {paymentStatus === "REJECTED" && payment.rejectReason && (
                            <p className="mt-2 max-w-64 text-xs text-destructive">
                              {payment.rejectReason}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">No payment submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={!freeDates[agent.id] || setFreePlan.isPending}
                        onClick={() =>
                          freeDates[agent.id] &&
                          setFreePlan.mutate({ agentId: agent.id, date: freeDates[agent.id] })
                        }
                        className="mb-2 rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                      >
                        Grant free plan
                      </button>
                      <button
                        type="button"
                        disabled={toggleAgent.isPending}
                        onClick={() =>
                          toggleAgent.mutate({
                            agentId: agent.id,
                            status: agent.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                          })
                        }
                        className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold"
                      >
                        {agent.status === "ACTIVE" ? (
                          <>
                            <ShieldAlert className="size-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <Shield className="size-3.5" /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="p-8 text-center text-muted-foreground">No agents matched your search.</p>
        )}
        {agentsQuery.data && agentsQuery.data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t p-3 text-sm">
            <span>
              Page {agentsQuery.data.pagination.page} of {agentsQuery.data.pagination.pages} ·{" "}
              {agentsQuery.data.pagination.total} agents
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
                disabled={page >= agentsQuery.data.pagination.pages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-md border px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Review UPI payment</h2>
              <button
                type="button"
                onClick={() => setSelectedId("")}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>
            {detailQuery.isLoading ? (
              <VehicleLoading variant="section" />
            ) : detailQuery.isError || !selected ? (
              <p role="alert" className="text-destructive">
                Payment details could not be loaded.
              </p>
            ) : (
              <>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Plan</dt>
                    <dd className="font-semibold">
                      {selected.planName} · {formatCurrency(selected.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {selected.paymentApp === "Admin verified" ? "Payment reference" : "UTR"}
                    </dt>
                    <dd className="font-semibold">
                      {selected.paymentApp === "Admin verified" ? "Admin verified" : selected.utr}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Paid via</dt>
                    <dd className="font-semibold">{selected.paymentApp}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Payment date</dt>
                    <dd className="font-semibold">{formatDate(selected.paymentDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="font-semibold">{formatDate(selected.createdAt)}</dd>
                  </div>
                </dl>
                {selected.screenshot && (
                  <img
                    src={selected.screenshot}
                    alt="Agent payment screenshot"
                    className="max-h-80 max-w-full rounded-lg border object-contain"
                  />
                )}
                {selected.status === "APPROVED" ? (
                  <button
                    type="button"
                    onClick={() => void downloadInvoice(selected)}
                    className="rounded-md border px-4 py-2 text-sm font-semibold"
                  >
                    Download invoice PDF
                  </button>
                ) : selected.status === "PENDING" ? (
                  <div className="space-y-3 border-t pt-4">
                    <label className="block text-sm font-medium">
                      Rejection reason (optional)
                      <textarea
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        maxLength={500}
                        rows={2}
                        className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={review.isPending || settingsQuery.isLoading}
                        onClick={() => setInvoicePreviewOpen(true)}
                        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Preview invoice before approval
                      </button>
                      <button
                        type="button"
                        disabled={review.isPending}
                        onClick={() =>
                          review.mutate({
                            id: selected.id,
                            payload: { status: "REJECTED", rejectReason },
                          })
                        }
                        className="rounded-md border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-50"
                      >
                        Reject payment
                      </button>
                    </div>
                    {invoicePreviewOpen && (
                      <div className="space-y-3 border-t pt-4">
                        <InvoiceDraftPreview
                          planName={selected.planName}
                          description={selected.planDescription}
                          amount={selected.amount}
                          customerName={selected.customer.fullName}
                          customerBusiness={selected.customer.businessName}
                          supplierName={selected.seller.businessName}
                          supplierAddress={selected.seller.address}
                          defaultGstEnabled={settingsQuery.data?.invoiceGstEnabled ?? false}
                          gstEnabled={invoiceGstEnabled}
                          onGstEnabledChange={setInvoiceGstEnabled}
                          gstRate={invoiceGstRate}
                          onGstRateChange={setInvoiceGstRate}
                          sellerGstin={invoiceSellerGstin}
                          onSellerGstinChange={setInvoiceSellerGstin}
                          authorizedSignatory={settingsQuery.data?.invoiceAuthorizedSignatory ?? ""}
                          signatureImage={
                            settingsQuery.data?.invoiceSignatureImage ??
                            selected.seller.signatureImage
                          }
                          paymentDate={selected.paymentDate}
                        />
                        {!amountMatchesPayment && (
                          <p role="alert" className="text-sm font-semibold text-destructive">
                            Preview total {formatCurrency(previewTotal)} does not match the amount
                            quoted/received (
                            {formatCurrency(selected.totalAmount || selected.amount)}). Change the
                            GST selection or collect the difference before approving.
                          </p>
                        )}
                        <button
                          type="button"
                          disabled={
                            review.isPending ||
                            !amountMatchesPayment ||
                            (invoiceGstEnabled &&
                              !/^[0-9A-Z]{15}$/.test(invoiceSellerGstin.trim().toUpperCase()))
                          }
                          onClick={() =>
                            review.mutate({
                              id: selected.id,
                              payload: {
                                status: "APPROVED",
                                gstEnabled: invoiceGstEnabled,
                                gstRate: invoiceGstRate,
                                sellerGstin: invoiceSellerGstin.trim().toUpperCase(),
                              },
                            })
                          }
                          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Confirm invoice & approve payment
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This payment has already been reviewed.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
