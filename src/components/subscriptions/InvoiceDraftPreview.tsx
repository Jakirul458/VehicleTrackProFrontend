import { formatCurrency, formatDate } from "@/lib/expiry";

interface InvoiceDraftPreviewProps {
  planName: string;
  description: string;
  amount: number;
  customerName: string;
  customerBusiness?: string;
  supplierName: string;
  supplierAddress?: string;
  defaultGstEnabled: boolean;
  gstEnabled: boolean;
  onGstEnabledChange: (value: boolean) => void;
  gstRate: number;
  onGstRateChange: (value: number) => void;
  sellerGstin: string;
  onSellerGstinChange: (value: string) => void;
  authorizedSignatory?: string;
  signatureImage?: string;
  paymentDate?: string;
  periodEnd?: string;
}

export function InvoiceDraftPreview({
  planName,
  description,
  amount,
  customerName,
  customerBusiness,
  supplierName,
  supplierAddress,
  defaultGstEnabled,
  gstEnabled,
  onGstEnabledChange,
  gstRate,
  onGstRateChange,
  sellerGstin,
  onSellerGstinChange,
  authorizedSignatory,
  signatureImage,
  paymentDate,
  periodEnd,
}: InvoiceDraftPreviewProps) {
  const gstAmount = gstEnabled ? Math.round(amount * (gstRate / 100) * 100) / 100 : 0;
  const total = Math.round((amount + gstAmount) * 100) / 100;
  const validGstin = /^[0-9A-Z]{15}$/.test(sellerGstin.trim().toUpperCase());

  return (
    <section className="space-y-5 rounded-xl border bg-muted/20 p-4 sm:p-6">
      <div>
        <h3 className="text-lg font-bold">Invoice preview & options</h3>
        <p className="text-sm text-muted-foreground">
          Review the billed amount, tax details, and customer before generating the invoice.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={gstEnabled}
            onChange={(event) => onGstEnabledChange(event.target.checked)}
            className="size-4 accent-primary"
          />
          Include GST on this invoice
        </label>
        <label className="space-y-1 text-sm font-medium">
          GST rate (%)
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            disabled={!gstEnabled}
            value={gstRate}
            onChange={(event) => onGstRateChange(Number(event.target.value))}
            className="h-10 w-full rounded-md border bg-background px-3 disabled:opacity-50"
          />
        </label>
        <label className="space-y-1 text-sm font-medium sm:col-span-2">
          Supplier GSTIN
          <input
            maxLength={15}
            value={sellerGstin}
            onChange={(event) => onSellerGstinChange(event.target.value.toUpperCase())}
            placeholder="Optional; configure in Admin Settings"
            className="h-10 w-full rounded-md border bg-background px-3 uppercase"
          />
        </label>
      </div>
      {gstEnabled && !validGstin && (
        <p role="alert" className="text-sm font-medium text-destructive">
          A valid 15-character GSTIN is required before generating an invoice with GST.
        </p>
      )}
      {!gstEnabled && defaultGstEnabled && (
        <p className="text-xs text-muted-foreground">
          GST has been turned off for this invoice. The selected plan price will be billed without
          additional tax.
        </p>
      )}
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="flex items-start justify-between gap-4 bg-slate-900 p-4 text-white">
          <div>
            <p className="text-lg font-bold">{supplierName || "VehicleTrack Pro"}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-300">
              Subscription invoice preview
            </p>
            {supplierAddress && <p className="mt-2 text-xs text-slate-200">{supplierAddress}</p>}
          </div>
          <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100">
            DRAFT
          </span>
        </div>
        <div className="grid gap-4 border-b p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Billed to</p>
            <p className="mt-1 font-semibold">{customerName || "Agent name"}</p>
            {customerBusiness && <p className="text-sm">{customerBusiness}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Supplier GSTIN</p>
            <p className="mt-1 font-medium">{sellerGstin || "Not supplied"}</p>
            <p className="text-xs text-muted-foreground">
              {gstEnabled ? `GST @ ${gstRate}%` : "GST not charged"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Paid on {formatDate(paymentDate)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Valid through {formatDate(periodEnd)}
            </p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 border-b pb-3 text-xs font-bold uppercase text-muted-foreground">
            <span>Subscription plan</span>
            <span>Amount</span>
          </div>
          <div className="flex items-start justify-between gap-3 py-4">
            <div>
              <p className="font-semibold">{planName}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
            </div>
            <p className="whitespace-nowrap font-semibold">{formatCurrency(amount)}</p>
          </div>
          <div className="ml-auto max-w-xs space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between gap-4">
              <span>Plan amount</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            {gstEnabled && (
              <div className="flex justify-between gap-4">
                <span>GST ({gstRate}%)</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 border-t bg-slate-50 p-4">
          <p className="text-xs text-muted-foreground">Computer-generated subscription invoice</p>
          <div className="text-right">
            {signatureImage && (
              <img
                src={signatureImage}
                alt="Authorized signature"
                className="ml-auto mb-1 max-h-10 max-w-32 object-contain"
              />
            )}
            <p className="min-w-36 border-t border-slate-400 pt-1 text-xs font-semibold">
              {authorizedSignatory || "Authorized signatory"}
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Preview only; invoice number and final amount will be recorded when you confirm. Ensure GST
        details are correct before issuing.
      </p>
    </section>
  );
}
