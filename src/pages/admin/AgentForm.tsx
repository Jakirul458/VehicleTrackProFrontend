import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api";
import { normalizeApiError } from "@/api/client";
import type { Agent } from "@/types";
import { toast } from "sonner";

export default function AgentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!id;
  const {
    data: agent,
    isLoading,
    isError,
  } = useQuery<Agent>({
    queryKey: ["agent", id],
    queryFn: () => adminApi.agents.get(id!),
    enabled: isEdit,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") ?? "").trim();
    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      toast.error("Enter a valid phone number.");
      return;
    }

    const common = {
      fullName: String(form.get("fullName") ?? "").trim(),
      businessName: String(form.get("businessName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone,
      address: String(form.get("address") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      state: String(form.get("state") ?? "").trim(),
      pinCode: String(form.get("pinCode") ?? "").trim(),
      status: String(form.get("status") ?? "ACTIVE") as "ACTIVE" | "SUSPENDED",
    };
    const moduleAccess = {
      insurance: form.get("insurance") === "on",
      tax: form.get("tax") === "on",
      puc: form.get("puc") === "on",
    };

    const password = String(form.get("password") ?? "");
    if (!isEdit && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!isEdit && password !== String(form.get("confirmPassword") ?? "")) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await adminApi.agents.update(id!, common);
        toast.success("Agent updated successfully.");
      } else {
        await adminApi.agents.create({ ...common, moduleAccess, password });
        toast.success("Agent created successfully.");
      }
      await queryClient.invalidateQueries({ queryKey: ["agents"] });
      navigate("/admin/agents");
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      toast.error(
        normalizedError.status === 409
          ? "This email or phone number is already in use by another account. Check the details and try again."
          : normalizedError.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading agent…</p>;
  }
  if (isEdit && (isError || !agent)) {
    return (
      <div>
        <Link to="/admin/agents" className="text-primary hover:underline">
          Back to agents
        </Link>
        <p className="mt-4 rounded-lg border bg-card p-6 text-destructive">
          Agent information could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">{isEdit ? "Edit Agent" : "Create Agent"}</h1>
      <form
        key={agent?.id ?? "new-agent"}
        onSubmit={(event) => void handleSubmit(event)}
        className="grid gap-5 rounded-lg border bg-card p-6 sm:grid-cols-2"
      >
        <label className="space-y-1.5 text-sm font-medium">
          Full name
          <input
            name="fullName"
            required
            minLength={2}
            maxLength={120}
            defaultValue={agent?.fullName ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Business name
          <input
            name="businessName"
            required
            minLength={2}
            maxLength={160}
            defaultValue={agent?.businessName ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            defaultValue={agent?.email ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Phone
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            minLength={10}
            maxLength={16}
            defaultValue={agent?.mobile ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        {!isEdit && (
          <>
            <label className="space-y-1.5 text-sm font-medium">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="h-10 w-full rounded-md border bg-background px-3 font-normal"
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="h-10 w-full rounded-md border bg-background px-3 font-normal"
              />
            </label>
          </>
        )}
        <label className="space-y-1.5 text-sm font-medium">
          Address
          <input
            name="address"
            maxLength={500}
            defaultValue={agent?.address ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          City
          <input
            name="city"
            defaultValue={agent?.city ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          State
          <input
            name="state"
            defaultValue={agent?.state ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          PIN code
          <input
            name="pinCode"
            defaultValue={agent?.pinCode ?? ""}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={agent?.status ?? "ACTIVE"}
            className="h-10 w-full rounded-md border bg-background px-3 font-normal"
          >
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </label>
        {!isEdit && (
          <fieldset className="space-y-3 sm:col-span-2">
            <legend className="font-semibold">Document access</legend>
            <p className="text-sm text-muted-foreground">
              Choose the services this agent can use. All are enabled by default.
            </p>
            <div className="flex flex-wrap gap-5">
              {[
                ["insurance", "Insurance"],
                ["tax", "Tax"],
                ["puc", "PUC"],
              ].map(([name, label]) => (
                <label key={name} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked
                    className="size-4 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create agent"}
          </button>
          <Link to="/admin/agents" className="rounded-md border px-4 py-2 hover:bg-accent">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
