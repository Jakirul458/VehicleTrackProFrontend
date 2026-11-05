import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionAdminApi } from "@/api";
import { VehicleLoading } from "@/components/common/VehicleLoading";
import { formatCurrency } from "@/lib/expiry";
import type { SubscriptionPlan } from "@/types";

type PlanInput = Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">;

const emptyPlan: PlanInput = {
  name: "",
  description: "",
  original_price: 0,
  current_price: 0,
  offer_tag: "",
};

export default function AdminSubscriptionPlans() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PlanInput>(emptyPlan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: subscriptionAdminApi.plans.list,
    staleTime: 0,
  });
  const savePlan = useMutation({
    mutationFn: () =>
      editingId
        ? subscriptionAdminApi.plans.update(editingId, form)
        : subscriptionAdminApi.plans.create(form),
    onSuccess: async () => {
      setForm(emptyPlan);
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success(editingId ? "Plan updated." : "Plan added.");
    },
    onError: () => toast.error("Plan could not be saved. Check the fields and try again."),
  });
  const deletePlan = useMutation({
    mutationFn: subscriptionAdminApi.plans.delete,
    onSuccess: async (_deleted, id) => {
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyPlan);
      }
      await queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plan deleted.");
    },
    onError: () => toast.error("Plan could not be deleted. Refresh and try again."),
  });

  function editPlan(plan: SubscriptionPlan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description,
      original_price: plan.original_price,
      current_price: plan.current_price,
      offer_tag: plan.offer_tag,
    });
  }

  function updateField(key: keyof PlanInput, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Subscription plans</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add, edit, or remove plans. Changes appear on the public pricing and UPI payment pages.
        </p>
      </header>

      <form
        className="space-y-4 rounded-lg border bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          savePlan.mutate();
        }}
      >
        <h2 className="text-lg font-semibold">{editingId ? "Edit plan" : "Add a plan"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Plan name
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Offer tag (optional)
            <input
              maxLength={80}
              value={form.offer_tag}
              onChange={(event) => updateField("offer_tag", event.target.value)}
              placeholder="Puja Offer"
              className="h-10 w-full rounded-md border bg-background px-3"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Original price (₹)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.original_price}
              onChange={(event) => updateField("original_price", Number(event.target.value))}
              className="h-10 w-full rounded-md border bg-background px-3"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Current price (₹)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.current_price}
              onChange={(event) => updateField("current_price", Number(event.target.value))}
              className="h-10 w-full rounded-md border bg-background px-3"
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
            One-sentence description
            <textarea
              required
              minLength={5}
              maxLength={300}
              rows={2}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={savePlan.isPending}
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
          >
            {savePlan.isPending ? "Saving…" : editingId ? "Save changes" : "Add plan"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyPlan);
              }}
              className="rounded-md border px-5 py-2.5 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Current plans</h2>
        {plansQuery.isLoading ? (
          <div className="rounded-lg border bg-card">
            <VehicleLoading variant="section" />
          </div>
        ) : plansQuery.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-card p-6 text-destructive"
          >
            Plans could not be loaded. Refresh and try again.
          </p>
        ) : plansQuery.data?.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {plansQuery.data.map((plan) => (
              <article key={plan.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-sm">
                      <span className="mr-2 text-muted-foreground line-through">
                        {formatCurrency(plan.original_price)}
                      </span>
                      <strong>{formatCurrency(plan.current_price)}</strong>
                      {plan.offer_tag && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                          {plan.offer_tag}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editPlan(plan)}
                      className="rounded-md border px-3 py-2 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletePlan.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete "${plan.name}" from public pricing?`)) {
                          deletePlan.mutate(plan.id);
                        }
                      }}
                      className="rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            No plans exist. Add a plan above to publish pricing.
          </p>
        )}
      </section>
    </div>
  );
}
