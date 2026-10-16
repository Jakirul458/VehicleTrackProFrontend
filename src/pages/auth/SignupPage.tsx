import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { normalizeApiError, type NormalizedApiError } from "@/api/client";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirmPassword") ?? "")) {
      setError({ status: 400, message: "Passwords do not match." });
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signup({
        fullName: String(form.get("fullName") ?? "").trim(),
        businessName: String(form.get("businessName") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        mobile: String(form.get("mobile") ?? "").trim(),
        password,
      });
      navigate("/agent/dashboard", { replace: true });
    } catch (signupError) {
      setError(normalizeApiError(signupError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl sm:p-9">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <Truck className="h-5 w-5 text-primary" />
          VehicleTrack Pro
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Start your 7-day free trial</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create an account to try Insurance, Tax and PUC tracking. No payment is needed to sign up.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error.message}</p>
            {error.code === "ACCOUNT_VALIDITY_EXPIRED" && (
              <a href="tel:6294527072" className="mt-2 inline-block font-semibold underline">
                Call admin: 6294527072
              </a>
            )}
          </div>
        )}

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Full name
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              className="h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Business name
            <input
              name="businessName"
              required
              minLength={2}
              maxLength={160}
              autoComplete="organization"
              className="h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            Email address
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              className="h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            Mobile number
            <input
              name="mobile"
              type="tel"
              required
              minLength={10}
              maxLength={16}
              pattern="\+?[0-9]{10,15}"
              autoComplete="tel"
              className="h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={200}
              autoComplete="new-password"
              className="h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={200}
              autoComplete="new-password"
              className="h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {isSubmitting ? "Creating your account…" : "Create account and start trial"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          After the trial, the annual plan is ₹4,999. Contact{" "}
          <a href="tel:6294527072" className="font-medium text-primary hover:underline">
            6294527072
          </a>{" "}
          to purchase and extend your access.
        </p>
      </div>
    </main>
  );
}
