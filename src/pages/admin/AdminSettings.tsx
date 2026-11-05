import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/api";
import { normalizeApiError } from "@/api/client";
import type { PlatformSettings } from "@/types";
import { VehicleLoading } from "@/components/common/VehicleLoading";

const emptySettings: PlatformSettings = {
  supportWhatsapp: "",
  supportEmail: "",
  businessName: "VehicleTrack Pro",
  businessAddress: "",
  businessGstin: "",
  invoiceGstEnabled: false,
  invoiceGstRate: 18,
  invoiceAuthorizedSignatory: "",
  invoiceSignatureImage: "",
  qrCodeUrl: "",
  upiId: "",
  bankAccountName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankBranch: "",
  monthlyPrice: 0,
  yearlyPrice: 4999,
  lifetimePrice: 0,
  insuranceOnlyPrice: 1999,
  roadTaxOnlyPrice: 999,
  pucOnlyPrice: 999,
  taxPucPrice: 1799,
  insuranceTaxPrice: 2799,
  insurancePucPrice: 2799,
  allModulesPrice: 3600,
};

const textFields: { key: keyof PlatformSettings; label: string; type?: string }[] = [
  { key: "supportWhatsapp", label: "WhatsApp number" },
  { key: "supportEmail", label: "Support Gmail", type: "email" },
  { key: "businessName", label: "Invoice business name" },
  { key: "businessAddress", label: "Invoice business address" },
  { key: "businessGstin", label: "Business GSTIN (optional)" },
  { key: "invoiceAuthorizedSignatory", label: "Invoice authorized signatory" },
  { key: "upiId", label: "UPI ID" },
  { key: "bankAccountName", label: "Account holder name" },
  { key: "bankName", label: "Bank name" },
  { key: "bankAccountNumber", label: "Account number" },
  { key: "bankIfsc", label: "IFSC" },
  { key: "bankBranch", label: "Branch" },
];

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<PlatformSettings>(emptySettings);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: adminApi.settings.get,
  });
  const saveSettings = useMutation({
    mutationFn: adminApi.settings.update,
    onSuccess: async (saved) => {
      setSettings(saved);
      await queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
      toast.success("Payment settings saved.");
    },
    onError: (error) => toast.error(normalizeApiError(error).message),
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const setField = (key: keyof PlatformSettings, value: string | number | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  function loadQrImage(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Choose a PNG, JPEG, or WebP QR image.");
      return;
    }
    if (file.size > 500_000) {
      toast.error("QR image must be 500 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setField("qrCodeUrl", reader.result);
    };
    reader.onerror = () => toast.error("QR image could not be read.");
    reader.readAsDataURL(file);
  }

  function loadSignatureImage(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Choose a PNG or JPEG signature image.");
      return;
    }
    if (file.size > 250_000) {
      toast.error("Signature image must be 250 KB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setField("invoiceSignatureImage", reader.result);
      else toast.error("Signature image could not be read.");
    };
    reader.onerror = () => toast.error("Signature image could not be read.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure payment instructions, support contacts, and supplier details printed on
          subscription invoices.
        </p>
      </header>
      {isLoading ? (
        <div className="rounded-lg border bg-card">
          <VehicleLoading variant="section" />
        </div>
      ) : isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-card p-6 text-destructive"
        >
          Payment settings could not be loaded. Refresh and try again.
        </p>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveSettings.mutate(settings);
          }}
        >
          <section className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Payment and support details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {textFields.map(({ key, label, type }) => (
                <label key={key} className="space-y-1.5 text-sm font-medium">
                  {label}
                  <input
                    type={type ?? "text"}
                    value={String(settings[key])}
                    onChange={(event) => setField(key, event.target.value)}
                    maxLength={key === "businessGstin" ? 15 : undefined}
                    className="h-10 w-full rounded-md border bg-background px-3"
                  />
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="qr-code" className="block text-sm font-medium">
                QR code image
              </label>
              <input
                id="qr-code"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => loadQrImage(event.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
              />
              <input
                type="url"
                aria-label="QR image URL"
                placeholder="Or paste a publicly accessible image URL"
                value={settings.qrCodeUrl.startsWith("data:image/") ? "" : settings.qrCodeUrl}
                onChange={(event) => setField("qrCodeUrl", event.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
              {settings.qrCodeUrl && (
                <img
                  src={settings.qrCodeUrl}
                  alt="Payment QR code preview"
                  className="size-44 rounded-lg border bg-white object-contain p-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Embedded QR images are limited to 500 KB. Bank/UPI details can be shown as a
                fallback.
              </p>
            </div>
          </section>
          <section className="space-y-4 rounded-lg border bg-card p-6">
            <div>
              <h2 className="text-lg font-semibold">Subscription invoice defaults</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                GST is off by default. These defaults can be reviewed and edited before each
                subscription invoice is issued. Confirm GST applicability with your tax
                professional.
              </p>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={settings.invoiceGstEnabled}
                onChange={(event) => setField("invoiceGstEnabled", event.target.checked)}
                className="size-4 accent-primary"
              />
              Default to including GST on new subscription invoices
            </label>
            <label className="block max-w-sm space-y-1.5 text-sm font-medium">
              Default GST rate (%)
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={settings.invoiceGstRate}
                onChange={(event) => setField("invoiceGstRate", Number(event.target.value))}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
            </label>
            <div className="space-y-2">
              <label htmlFor="invoice-signature" className="block text-sm font-medium">
                Authorized signature image (optional, max 250 KB)
              </label>
              <input
                id="invoice-signature"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => loadSignatureImage(event.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
              />
              {settings.invoiceSignatureImage && (
                <div className="flex items-center gap-3">
                  <img
                    src={settings.invoiceSignatureImage}
                    alt="Invoice authorized signature preview"
                    className="max-h-20 max-w-48 rounded border bg-white p-2 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setField("invoiceSignatureImage", "")}
                    className="rounded-md border px-3 py-1.5 text-sm"
                  >
                    Remove signature
                  </button>
                </div>
              )}
            </div>
          </section>
          <button
            type="submit"
            disabled={saveSettings.isPending}
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
          >
            {saveSettings.isPending ? "Saving…" : "Save payment settings"}
          </button>
        </form>
      )}
    </div>
  );
}
