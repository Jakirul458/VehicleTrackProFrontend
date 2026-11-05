import { useState } from "react";
import type { InvoiceParty, SubscriptionInvoiceUpdate, SubscriptionPayment } from "@/types";

type PartyFields = Record<keyof Omit<InvoiceParty, "signatureImage">, string>;

interface InvoiceForm {
  invoiceNumber: string;
  planName: string;
  planDescription: string;
  paymentDate: string;
  authorizedSignatory: string;
  customer: PartyFields;
  seller: PartyFields;
}

const partyFieldLabels: Record<keyof PartyFields, string> = {
  fullName: "Contact name",
  businessName: "Business name",
  email: "Email",
  mobile: "Mobile",
  address: "Address",
  city: "City",
  state: "State",
  pinCode: "PIN code",
  gstin: "GSTIN",
};

const emptyParty = (): PartyFields => ({
  fullName: "",
  businessName: "",
  email: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  gstin: "",
});

function formFromInvoice(invoice: SubscriptionPayment): InvoiceForm {
  const toPartyFields = (party: InvoiceParty): PartyFields => ({
    ...emptyParty(),
    fullName: party.fullName,
    businessName: party.businessName,
    email: party.email,
    mobile: party.mobile,
    address: party.address,
    city: party.city,
    state: party.state,
    pinCode: party.pinCode,
    gstin: party.gstin,
  });
  return {
    invoiceNumber: invoice.invoiceNumber,
    planName: invoice.planName,
    planDescription: invoice.planDescription,
    paymentDate: invoice.paymentDate.slice(0, 10),
    authorizedSignatory: invoice.authorizedSignatory ?? "",
    customer: toPartyFields(invoice.customer),
    seller: toPartyFields(invoice.seller),
  };
}

interface InvoiceEditDialogProps {
  invoice: SubscriptionPayment;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: SubscriptionInvoiceUpdate) => void;
}

export function InvoiceEditDialog({ invoice, saving, onClose, onSave }: InvoiceEditDialogProps) {
  const [form, setForm] = useState(() => formFromInvoice(invoice));

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: SubscriptionInvoiceUpdate = {
      invoiceNumber: form.invoiceNumber.trim(),
      planName: form.planName.trim(),
      planDescription: form.planDescription.trim(),
      paymentDate: form.paymentDate,
      authorizedSignatory: form.authorizedSignatory.trim(),
      customer: form.customer,
      seller: form.seller,
    };
    onSave(payload);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-invoice-title"
        className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-card p-6 shadow-xl"
      >
        <form onSubmit={submit} className="space-y-5">
          <header>
            <h2 id="edit-invoice-title" className="text-xl font-semibold">
              Edit invoice
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified payment amount and subscription validity cannot be changed here.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["invoiceNumber", "Invoice number"],
                ["planName", "Plan name"],
                ["paymentDate", "Payment date"],
                ["authorizedSignatory", "Authorized signatory"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-1 text-sm font-medium">
                {label}
                <input
                  type={key === "paymentDate" ? "date" : "text"}
                  required={key !== "authorizedSignatory"}
                  max={key === "paymentDate" ? new Date().toISOString().slice(0, 10) : undefined}
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                />
              </label>
            ))}
            <label className="space-y-1 text-sm font-medium sm:col-span-2">
              Plan description
              <textarea
                rows={2}
                value={form.planDescription}
                onChange={(event) => setForm({ ...form, planDescription: event.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 font-normal"
              />
            </label>
          </div>

          {(["customer", "seller"] as const).map((party) => (
            <fieldset key={party} className="space-y-3 rounded-lg border p-4">
              <legend className="px-1 text-sm font-semibold">
                {party === "customer" ? "Billed agent" : "Supplier"}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(partyFieldLabels) as (keyof PartyFields)[]).map((key) => (
                  <label key={key} className="space-y-1 text-sm font-medium">
                    {partyFieldLabels[key]}
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={form[party][key]}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          [party]: { ...form[party], [key]: event.target.value },
                        })
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
