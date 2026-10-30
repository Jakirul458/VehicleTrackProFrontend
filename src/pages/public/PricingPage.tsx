import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { paymentApi } from "@/api";
import { subscriptionPlans } from "@/constants/pricing";
import { formatCurrency } from "@/lib/expiry";

export default function PricingPage() {
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: paymentApi.settings,
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-800">
            Simple annual plans
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Choose the services you need
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Insurance, road tax and PUC services with a discount on every combo—and an all-in-one
            subscription for all three.
          </p>
          <p lang="bn" className="mt-2 text-base text-slate-600">
            সব পরিষেবা একসঙ্গে, একটি Subscription-এ।
          </p>
        </header>

        {isLoading ? (
          <p className="rounded-2xl border bg-white p-8 text-center text-slate-600">
            Loading current prices…
          </p>
        ) : isError || !settings ? (
          <p
            role="alert"
            className="rounded-2xl border border-destructive/40 bg-white p-8 text-center text-destructive"
          >
            Pricing could not be loaded. Please try again later.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => {
              const isAllInOne = plan.key === "allModulesPrice";
              return (
                <article
                  key={plan.key}
                  className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                    isAllInOne ? "border-cyan-600 ring-2 ring-cyan-600/15" : "border-slate-200"
                  }`}
                >
                  {isAllInOne && (
                    <span className="mb-3 w-fit rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-900">
                      Best value
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-slate-900">{plan.label}</h2>
                  <p className="mt-1 text-sm text-slate-600">{plan.modules}</p>
                  <p className="mt-5 text-3xl font-extrabold text-slate-900">
                    {formatCurrency(settings[plan.key])}
                    <span className="ml-1 text-sm font-medium text-slate-500">/ year</span>
                  </p>
                  <div className="my-5 flex items-center gap-2 text-sm text-slate-600">
                    <Check className="size-4 text-emerald-600" />
                    Annual access to selected modules
                  </div>
                  <Link
                    to={`/renewal?plan=${plan.key}`}
                    className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition ${
                      isAllInOne
                        ? "bg-gradient-to-r from-sky-600 to-teal-500 text-white hover:shadow-lg"
                        : "border border-slate-300 text-slate-800 hover:border-cyan-600 hover:text-cyan-800"
                    }`}
                  >
                    Choose this plan
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-600">
          Need help with renewal?{" "}
          <Link to="/renewal" className="font-semibold text-cyan-800 hover:underline">
            View payment instructions
          </Link>
        </p>
      </div>
    </main>
  );
}
