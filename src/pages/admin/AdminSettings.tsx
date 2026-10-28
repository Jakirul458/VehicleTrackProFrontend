import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/api";
import type { PlatformSettings } from "@/types";

const emptySettings: PlatformSettings = {
  supportWhatsapp: "",
  supportEmail: "",
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
};

const textFields: { key: keyof PlatformSettings; label: string; type?: string }[] = [
  { key: "supportWhatsapp", label: "WhatsApp number" },
  { key: "supportEmail", label: "Support Gmail", type: "email" },
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
    onError: () => toast.error("Payment settings could not be saved."),
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const setField = (key: keyof PlatformSettings, value: string | number) => {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure the payment instructions shown to agents when their account validity expires.
        </p>
      </header>
      {isLoading ? (
        <div className="rounded-lg border bg-card p-6">Loading settings…</div>
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
            <h2 className="text-lg font-semibold">Renewal plans</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["monthlyPrice", "Monthly price"],
                  ["yearlyPrice", "Yearly price"],
                  ["lifetimePrice", "Lifetime price"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="space-y-1.5 text-sm font-medium">
                  {label} (₹)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings[key]}
                    onChange={(event) => setField(key, Number(event.target.value))}
                    className="h-10 w-full rounded-md border bg-background px-3"
                  />
                </label>
              ))}
            </div>
          </section>

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
                accept="image/png,image/jpeg,image/webp"
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
