import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle, Upload } from "lucide-react";
import { paymentApi } from "@/api";
import { toast } from "sonner";
import type { PlatformSettings } from "@/types";

type Plan = "monthly" | "yearly" | "lifetime";

const plans: { key: Plan; label: string; priceKey: keyof PlatformSettings }[] = [
  { key: "monthly", label: "Monthly", priceKey: "monthlyPrice" },
  { key: "yearly", label: "Yearly", priceKey: "yearlyPrice" },
  { key: "lifetime", label: "Lifetime", priceKey: "lifetimePrice" },
];

export default function RenewalPaymentPage() {
  const [plan, setPlan] = useState<Plan>("yearly");
  const [accountEmail, setAccountEmail] = useState("");
  const [slip, setSlip] = useState<File | null>(null);
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: paymentApi.settings,
  });

  const selected = plans.find((item) => item.key === plan)!;
  const price = settings?.[selected.priceKey] as number | undefined;
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") ?? "{}") as {
        fullName?: string;
        email?: string;
      };
    } catch {
      return {};
    }
  })();
  const email = accountEmail || user.email || "";
  const requestMessage = `Hello, I would like to renew my VehicleTrack Pro account.\nPlan: ${selected.label}\nAmount: ${price ? `₹${price}` : "Please confirm"}\nAccount email: ${email || "Please provide"}${slip ? `\nPayment slip: ${slip.name}` : ""}`;
  const whatsappDigits = settings?.supportWhatsapp.replace(/\D/g, "") ?? "";

  async function shareSlip() {
    if (!slip) {
      toast.error("Choose a payment slip first.");
      return;
    }
    if (navigator.share && navigator.canShare?.({ files: [slip] })) {
      try {
        await navigator.share({
          title: "VehicleTrack Pro renewal payment slip",
          text: requestMessage,
          files: [slip],
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error("The payment slip could not be shared. Try WhatsApp or email instead.");
      }
      return;
    }
    toast.info(
      "This browser cannot attach files from the share menu. Choose WhatsApp or email and attach the selected slip there.",
    );
  }

  function openWhatsApp() {
    if (!whatsappDigits) {
      toast.error(
        "WhatsApp contact has not been configured. Please use the support email or contact page.",
      );
      return;
    }
    window.open(
      `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(requestMessage)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function openEmail() {
    if (!settings?.supportEmail) {
      toast.error(
        "Support email has not been configured. Please use the WhatsApp contact or contact page.",
      );
      return;
    }
    window.location.href = `mailto:${encodeURIComponent(settings.supportEmail)}?subject=${encodeURIComponent("VehicleTrack Pro account renewal")}&body=${encodeURIComponent(requestMessage + (slip ? `\n\nPlease attach the payment slip: ${slip.name}` : ""))}`;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/login" className="text-sm font-medium text-primary hover:underline">
        ← Back to sign in
      </Link>
      <header className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Account renewal
        </p>
        <h1 className="mt-2 text-3xl font-bold">Renew your VehicleTrack Pro access</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Select a plan, pay using the QR/UPI or bank details, then share your payment slip with the
          administrator.
        </p>
      </header>
      {isLoading ? (
        <div className="rounded-xl border bg-card p-6">Loading payment instructions…</div>
      ) : isError || !settings ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/40 bg-card p-6 text-destructive"
        >
          Payment instructions could not be loaded. Please contact the administrator.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="space-y-5 rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold">Choose a renewal plan</h2>
            <div className="grid gap-3">
              {plans.map((item) => {
                const amount = settings[item.priceKey] as number;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={plan === item.key}
                    onClick={() => setPlan(item.key)}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left ${plan === item.key ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-accent/40"}`}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold">
                      {amount ? `₹${amount.toLocaleString("en-IN")}` : "Contact for price"}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="block space-y-1.5 text-sm font-medium">
              Account email
              <input
                type="email"
                value={accountEmail || user.email || ""}
                onChange={(event) => setAccountEmail(event.target.value)}
                placeholder="Email used to sign in"
                className="h-10 w-full rounded-md border bg-background px-3"
              />
            </label>
            {settings.supportWhatsapp && (
              <p className="text-sm text-muted-foreground">
                WhatsApp support:{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {settings.supportWhatsapp}
                </a>
              </p>
            )}
            {settings.supportEmail && (
              <p className="text-sm text-muted-foreground">
                Email support:{" "}
                <a
                  className="font-medium text-primary hover:underline"
                  href={`mailto:${settings.supportEmail}`}
                >
                  {settings.supportEmail}
                </a>
              </p>
            )}
          </section>

          <section className="space-y-5 rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold">Payment details</h2>
            {settings.qrCodeUrl ? (
              <div className="flex flex-col items-center rounded-lg border bg-white p-4">
                <img
                  src={settings.qrCodeUrl}
                  alt="Payment QR code"
                  className="max-h-64 max-w-full object-contain"
                />
                <span className="mt-2 text-sm text-slate-600">Scan this QR code to pay</span>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                QR code is not configured. Use the bank or UPI details below.
              </p>
            )}
            {settings.upiId && (
              <p className="text-sm">
                <span className="font-medium">UPI ID:</span> {settings.upiId}
              </p>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg bg-muted/40 p-4 text-sm">
              {[
                ["Account holder", settings.bankAccountName],
                ["Bank", settings.bankName],
                ["Account number", settings.bankAccountNumber],
                ["IFSC", settings.bankIfsc],
                ["Branch", settings.bankBranch],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="break-all font-medium">{value}</dd>
                  </div>
                ))}
              {!settings.bankAccountName && !settings.bankAccountNumber && !settings.upiId && (
                <div className="col-span-2 text-muted-foreground">
                  Bank/UPI details have not been added yet.
                </div>
              )}
            </dl>
            <div className="space-y-3 border-t pt-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-4 text-sm hover:bg-accent/40">
                <Upload className="size-5 text-primary" />
                <span className="min-w-0 flex-1 truncate">
                  {slip?.name ?? "Select payment slip (image or PDF)"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={(event) => setSlip(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
              <button
                type="button"
                disabled={!slip}
                onClick={() => void shareSlip()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Upload className="size-4" /> Share payment slip
              </button>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={openEmail}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent"
                >
                  <Mail className="size-4" /> Email
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share opens your device's share sheet when supported. Otherwise, attach the selected
                slip manually in WhatsApp or your email app.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
