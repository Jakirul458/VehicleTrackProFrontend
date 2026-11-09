import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { Download, Mail, MessageCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { paymentApi } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { daysLeft, formatCurrency, formatDate } from "@/lib/expiry";
import { createInvoicePdf, invoiceFilename } from "@/lib/invoice";
import { VehicleLoading } from "@/components/common/VehicleLoading";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { SubscriptionPayment } from "@/types";

export default function RenewalPaymentPage() {
  const [searchParams] = useSearchParams();
  const [planId, setPlanId] = useState(searchParams.get("plan") ?? "");
  const [utr, setUtr] = useState("");
  const [paymentApp, setPaymentApp] = useState("PhonePe");
  const [otherPaymentApp, setOtherPaymentApp] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [screenshot, setScreenshot] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [submittedPayment, setSubmittedPayment] = useState<SubscriptionPayment | null>(null);
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: paymentApi.plans,
  });
  const settingsQuery = useQuery({
    queryKey: ["payment-settings"],
    queryFn: paymentApi.settings,
  });
  const historyQuery = useQuery({
    queryKey: ["my-subscription-payments"],
    queryFn: paymentApi.mine,
    enabled: user?.role === "AGENT",
    refetchInterval: (query) =>
      query.state.data?.some((payment) => payment.status === "PENDING") ? 30_000 : false,
  });

  const plans = plansQuery.data ?? [];
  const selected = plans.find((item) => item.id === planId) ?? plans[0];
  const settings = settingsQuery.data;
  const gstRate = settings?.invoiceGstRate ?? 18;
  const checkoutGstAmount =
    selected && settings?.invoiceGstEnabled
      ? Math.round(selected.current_price * (gstRate / 100) * 100) / 100
      : 0;
  const checkoutTotal = selected
    ? Math.round((selected.current_price + checkoutGstAmount) * 100) / 100
    : 0;
  const upiUri = useMemo(() => {
    if (!selected || !settings?.upiId || selected.current_price <= 0) return "";
    const params = new URLSearchParams({
      pa: settings.upiId,
      pn: settings.businessName || "VehicleTrack Pro",
      am: (
        selected.current_price +
        (settings.invoiceGstEnabled
          ? Math.round(selected.current_price * ((settings.invoiceGstRate ?? 18) / 100) * 100) / 100
          : 0)
      ).toFixed(2),
      cu: "INR",
      tn: `VehicleTrack Pro - ${selected.name}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [selected, settings]);
  const whatsappDigits = normalizeWhatsAppNumber(settings?.supportWhatsapp ?? "") ?? "";
  const paymentSlipMessage = [
    "Hello, I have completed a VehicleTrack Pro subscription payment.",
    `Plan: ${selected?.name ?? ""}`,
    `Amount: ${formatCurrency(checkoutTotal)}`,
    "I am sharing my payment slip here. Please help verify the payment.",
  ].join("\n");
  const paymentSlipWhatsAppUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(paymentSlipMessage)}`
    : "";
  const pendingPayment =
    submittedPayment ?? historyQuery.data?.find((payment) => payment.status === "PENDING") ?? null;

  useEffect(() => {
    if (searchParams.get("plan")) setPlanId(searchParams.get("plan") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get("plan") || plansQuery.isLoading) return;
    document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
  }, [searchParams, plansQuery.isLoading]);

  useEffect(() => {
    if (!user || !historyQuery.data) return;
    const latestApprovedExpiry = historyQuery.data.reduce<string | undefined>((latest, payment) => {
      if (payment.status !== "APPROVED" || !payment.periodEnd) return latest;
      if (!latest || new Date(payment.periodEnd).getTime() > new Date(latest).getTime()) {
        return payment.periodEnd;
      }
      return latest;
    }, undefined);
    if (
      latestApprovedExpiry &&
      new Date(latestApprovedExpiry).getTime() > new Date(user.trialEndDate ?? 0).getTime()
    ) {
      updateUser({ ...user, trialEndDate: latestApprovedExpiry });
    }
  }, [historyQuery.data, updateUser, user]);

  useEffect(() => {
    let active = true;
    setQrDataUrl("");
    if (!upiUri) return;
    void QRCode.toDataURL(upiUri, { width: 280, margin: 2, errorCorrectionLevel: "M" })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) toast.error("The payment QR code could not be generated.");
      });
    return () => {
      active = false;
    };
  }, [upiUri]);

  const submitPayment = useMutation({
    mutationFn: paymentApi.submit,
    onSuccess: async (payment) => {
      setSubmittedPayment(payment);
      setUtr("");
      setScreenshot("");
      setScreenshotName("");
      await queryClient.invalidateQueries({ queryKey: ["my-subscription-payments"] });
      toast.success("Payment submitted for manual verification.");
    },
  });

  function openPaymentWhatsApp(payment: SubscriptionPayment) {
    if (!whatsappDigits) {
      toast.error("WhatsApp contact is not configured. Please contact the administrator.");
      return;
    }
    const message = [
      "Hello, I have paid for my VehicleTrack Pro subscription.",
      `Plan: ${payment.planName}`,
      `Account: ${user?.fullName ?? ""}${user?.email ? ` (${user.email})` : ""}`,
      `Amount: ${formatCurrency(payment.totalAmount || payment.amount)}`,
      `UTR / Transaction No: ${payment.utr}`,
      `Paid via app: ${payment.paymentApp}`,
      `Payment date: ${formatDate(payment.paymentDate)}`,
      "Please verify my payment and extend my subscription validity.",
    ].join("\n");
    window.open(
      `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function chooseScreenshot(file?: File) {
    setScreenshot("");
    setScreenshotName("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Choose a PNG, JPEG, or WebP payment screenshot.");
      return;
    }
    if (file.size > 500_000) {
      toast.error("Payment screenshot must be 500 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setScreenshot(reader.result);
        setScreenshotName(file.name);
      } else {
        toast.error("The payment screenshot could not be read.");
      }
    };
    reader.onerror = () => toast.error("The payment screenshot could not be read.");
    reader.readAsDataURL(file);
  }

  async function downloadInvoice(payment: SubscriptionPayment) {
    try {
      const detailedInvoice = await paymentApi.invoice(payment.id);
      const pdf = await createInvoicePdf(detailedInvoice);
      pdf.save(invoiceFilename(detailedInvoice));
    } catch {
      toast.error("The invoice PDF could not be generated.");
    }
  }

  async function shareInvoice(payment: SubscriptionPayment) {
    let pdf: Awaited<ReturnType<typeof createInvoicePdf>>;
    let detailedInvoice: SubscriptionPayment;
    try {
      detailedInvoice = await paymentApi.invoice(payment.id);
      pdf = await createInvoicePdf(detailedInvoice);
    } catch {
      toast.error("The invoice PDF could not be generated.");
      return;
    }
    const file = new File([pdf.output("blob")], invoiceFilename(detailedInvoice), {
      type: "application/pdf",
    });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `VehicleTrack Pro invoice ${payment.invoiceNumber}`,
          text: `Subscription payment invoice ${payment.invoiceNumber}`,
          files: [file],
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error("The invoice could not be shared. Download it and attach it in WhatsApp.");
        return;
      }
    }
    pdf.save(invoiceFilename(detailedInvoice));
    if (!whatsappDigits) {
      toast.info("Invoice downloaded. Configure the support WhatsApp number to open WhatsApp.");
      return;
    }
    const message = `VehicleTrack Pro invoice ${payment.invoiceNumber} for ${payment.planName}. I have downloaded the PDF and will attach it here.`;
    window.open(
      `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast.info("Invoice downloaded. Attach the PDF to the WhatsApp message.");
  }

  const isLoading = plansQuery.isLoading || settingsQuery.isLoading;
  const hasLoadError = plansQuery.isError || settingsQuery.isError;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/pricing" className="text-sm font-semibold text-cyan-800 hover:underline">
          ← Back to plans
        </Link>
        <header className="mb-8 mt-5">
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-800">
            UPI subscription
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Pay and submit your transaction
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600">
            Pay the selected plan using UPI, then submit the 12-digit UTR for manual verification.
            Access and the invoice are issued after the administrator confirms the payment.
          </p>
        </header>
        {user?.role === "AGENT" &&
          (!user.trialEndDate || (daysLeft(user.trialEndDate) ?? -1) < 0) && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              Your free trial or subscription has expired. Choose a plan, pay, then share your UTR.
              Your access will be restored after the administrator verifies the payment.
            </div>
          )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <VehicleLoading variant="section" />
          </div>
        ) : hasLoadError ? (
          <p
            role="alert"
            className="rounded-2xl border border-destructive/40 bg-white p-6 text-destructive"
          >
            Plans or payment instructions could not be loaded. Please try again later.
          </p>
        ) : plans.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No subscription plans are available. Please contact the administrator.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Choose a plan</h2>
                <div className="grid gap-3">
                  {plans.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected?.id === item.id}
                      onClick={() => setPlanId(item.id)}
                      className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                        selected?.id === item.id
                          ? "border-cyan-600 bg-cyan-50 ring-1 ring-cyan-600"
                          : "border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50"
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatCurrency(item.current_price)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {settings?.supportWhatsapp && whatsappDigits && (
                    <p>
                      WhatsApp support:{" "}
                      <a
                        className="font-semibold text-cyan-800 hover:underline"
                        href={`https://wa.me/${whatsappDigits}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {settings.supportWhatsapp}
                      </a>
                    </p>
                  )}
                  {settings?.supportEmail && (
                    <p className="flex items-center gap-1">
                      <Mail className="size-4" />
                      <a
                        className="font-semibold text-cyan-800 hover:underline"
                        href={`mailto:${settings.supportEmail}`}
                      >
                        {settings.supportEmail}
                      </a>
                    </p>
                  )}
                </div>
              </section>

              <section
                id="payment-section"
                className="scroll-mt-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Payment details</h2>
                  {selected && (
                    <p className="mt-1 text-sm text-slate-600">
                      {selected.name} · Pay {formatCurrency(checkoutTotal)}
                    </p>
                  )}
                  {selected && settings?.invoiceGstEnabled && (
                    <dl className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt>Plan price</dt>
                        <dd>{formatCurrency(selected.current_price)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>GST ({gstRate}%)</dt>
                        <dd>{formatCurrency(checkoutGstAmount)}</dd>
                      </div>
                      <div className="flex justify-between gap-3 border-t pt-1 font-bold">
                        <dt>UPI amount</dt>
                        <dd>{formatCurrency(checkoutTotal)}</dd>
                      </div>
                    </dl>
                  )}
                </div>
                {qrDataUrl ? (
                  <div className="hidden flex-col items-center rounded-xl border border-slate-200 bg-white p-4 sm:flex">
                    <img
                      src={qrDataUrl}
                      alt="Dynamic UPI QR code for selected plan"
                      className="size-64"
                    />
                    <span className="mt-2 text-sm text-slate-600">
                      Scan to pay the selected amount
                    </span>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {!selected || selected.current_price <= 0
                      ? "This plan does not have a payable amount. Please choose another plan or contact support."
                      : settings?.upiId
                        ? "Preparing your plan-specific payment QR code…"
                        : "UPI ID is not configured. Please contact the administrator."}
                  </p>
                )}
                {!settings?.upiId && settings?.qrCodeUrl && (
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4">
                    <img
                      src={settings.qrCodeUrl}
                      alt="Configured payment QR code"
                      className="max-h-64 max-w-full object-contain"
                    />
                    <span className="mt-2 text-sm text-slate-600">
                      Scan the configured QR and enter {formatCurrency(checkoutTotal)} manually
                    </span>
                  </div>
                )}
                {upiUri && (
                  <a
                    href={upiUri}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-4 text-center font-bold text-white sm:hidden"
                  >
                    Pay via UPI App
                  </a>
                )}
                {paymentSlipWhatsAppUrl && (
                  <a
                    href={paymentSlipWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-center font-bold text-white hover:bg-[#1fb95a]"
                  >
                    <MessageCircle className="size-5" />
                    Share your payment slip via WhatsApp
                  </a>
                )}
                {paymentSlipWhatsAppUrl && (
                  <p className="-mt-3 text-center text-xs text-muted-foreground">
                    Click to open our WhatsApp chat, then attach and send your payment slip.
                  </p>
                )}
                {settings?.upiId && (
                  <p className="break-all text-sm">
                    <span className="font-medium">UPI ID:</span> {settings.upiId}
                  </p>
                )}
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg bg-muted/40 p-4 text-sm">
                  {[
                    ["Account holder", settings?.bankAccountName],
                    ["Bank", settings?.bankName],
                    ["Account number", settings?.bankAccountNumber],
                    ["IFSC", settings?.bankIfsc],
                    ["Branch", settings?.bankBranch],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label} className="contents">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="break-all font-medium">{value}</dd>
                      </div>
                    ))}
                  {!settings?.bankAccountName &&
                    !settings?.bankAccountNumber &&
                    !settings?.upiId &&
                    !settings?.qrCodeUrl && (
                      <div className="col-span-2 text-muted-foreground">
                        Bank/UPI details have not been added yet.
                      </div>
                    )}
                </dl>
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  {user?.role === "AGENT" ? (
                    <>
                      <h3 className="font-semibold text-slate-900">
                        Submit payment for verification
                      </h3>
                      <label className="block space-y-1.5 text-sm font-medium">
                        12-digit UTR / transaction ID
                        <input
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={12}
                          pattern="[0-9]{12}"
                          value={utr}
                          onChange={(event) =>
                            setUtr(event.target.value.replace(/\D/g, "").slice(0, 12))
                          }
                          placeholder="Enter the UTR from your UPI app"
                          className="h-11 w-full rounded-md border bg-background px-3"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block space-y-1.5 text-sm font-medium">
                          Paid using
                          <select
                            value={paymentApp}
                            onChange={(event) => setPaymentApp(event.target.value)}
                            className="h-11 w-full rounded-md border bg-background px-3"
                          >
                            <option>PhonePe</option>
                            <option>Google Pay</option>
                            <option>Paytm</option>
                            <option>BHIM</option>
                            <option>Other</option>
                          </select>
                        </label>
                        <label className="block space-y-1.5 text-sm font-medium">
                          Payment date
                          <input
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            value={paymentDate}
                            onChange={(event) => setPaymentDate(event.target.value)}
                            className="h-11 w-full rounded-md border bg-background px-3"
                          />
                        </label>
                      </div>
                      {paymentApp === "Other" && (
                        <label className="block space-y-1.5 text-sm font-medium">
                          Payment app name
                          <input
                            required
                            maxLength={40}
                            value={otherPaymentApp}
                            onChange={(event) => setOtherPaymentApp(event.target.value)}
                            placeholder="Enter the UPI app name"
                            className="h-11 w-full rounded-md border bg-background px-3"
                          />
                        </label>
                      )}
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm hover:bg-cyan-50">
                        <Upload className="size-5 text-cyan-700" />
                        <span className="min-w-0 flex-1 truncate">
                          {screenshotName || "Add payment screenshot (optional, max 500 KB)"}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) => chooseScreenshot(event.target.files?.[0])}
                          className="sr-only"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={
                          !selected ||
                          selected.current_price <= 0 ||
                          !/^\d{12}$/.test(utr) ||
                          !paymentDate ||
                          (paymentApp === "Other" && otherPaymentApp.trim().length < 2) ||
                          Boolean(pendingPayment) ||
                          submitPayment.isPending
                        }
                        onClick={() =>
                          selected &&
                          submitPayment.mutate({
                            planId: selected.id,
                            utr,
                            paymentApp:
                              paymentApp === "Other" ? otherPaymentApp.trim() : paymentApp,
                            paymentDate,
                            ...(screenshot ? { screenshot } : {}),
                          })
                        }
                        className="min-h-11 w-full rounded-xl bg-slate-900 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitPayment.isPending ? "Submitting…" : "Submit for verification"}
                      </button>
                      {pendingPayment && (
                        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <p className="text-sm font-semibold text-emerald-950">
                            Payment details submitted. Please share your UTR / transaction number,
                            payment app, and payment date with us on WhatsApp for verification.
                          </p>
                          <button
                            type="button"
                            onClick={() => openPaymentWhatsApp(pendingPayment)}
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 font-bold text-white hover:bg-[#1fb95a]"
                          >
                            <MessageCircle className="size-5" />
                            Share payment details on WhatsApp
                          </button>
                          <p className="text-xs text-emerald-900">
                            UTR {pendingPayment.utr} · {pendingPayment.paymentApp} · paid{" "}
                            {formatDate(pendingPayment.paymentDate)}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        UPI transfers are not auto-verified. Keep your UTR; the administrator
                        reviews it before confirming access.
                      </p>
                    </>
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p>
                        Sign in to your agent account to submit the UTR and receive an invoice after
                        verification.
                      </p>
                      <Link
                        to="/login"
                        className="mt-3 inline-flex font-semibold text-cyan-800 hover:underline"
                      >
                        Sign in to continue
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {user?.role === "AGENT" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Payment submissions and invoices
                </h2>
                {historyQuery.isLoading ? (
                  <div className="mt-4">
                    <VehicleLoading variant="section" />
                  </div>
                ) : historyQuery.isError ? (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    Payment history could not be loaded. Refresh and try again.
                  </p>
                ) : historyQuery.data?.length ? (
                  <div className="mt-4 divide-y divide-slate-200">
                    {historyQuery.data.map((payment) => (
                      <article
                        key={payment.id}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {payment.planName} ·{" "}
                            {formatCurrency(payment.totalAmount || payment.amount)}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {payment.paymentApp === "Admin verified"
                              ? "Admin-verified payment"
                              : `UTR ${payment.utr}`}{" "}
                            · {formatDate(payment.createdAt)}
                          </p>
                          <p
                            className={`mt-1 text-sm font-semibold ${
                              payment.status === "APPROVED"
                                ? "text-emerald-700"
                                : payment.status === "REJECTED"
                                  ? "text-destructive"
                                  : "text-amber-700"
                            }`}
                          >
                            {payment.status === "APPROVED"
                              ? `Verified · valid through ${formatDate(payment.periodEnd)}`
                              : payment.status === "REJECTED"
                                ? `Rejected${payment.rejectReason ? `: ${payment.rejectReason}` : ""}`
                                : "Pending manual verification"}
                          </p>
                        </div>
                        {payment.status === "APPROVED" && (
                          <div className="flex gap-2">
                            <Link
                              to="/agent/dashboard"
                              className="inline-flex min-h-10 items-center rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800"
                            >
                              Continue to account
                            </Link>
                            <button
                              type="button"
                              onClick={() => void downloadInvoice(payment)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-slate-50"
                            >
                              <Download className="size-4" /> Download PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => void shareInvoice(payment)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-cyan-50"
                            >
                              <MessageCircle className="size-4" /> WhatsApp
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">
                    No subscription payments have been submitted yet.
                  </p>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
