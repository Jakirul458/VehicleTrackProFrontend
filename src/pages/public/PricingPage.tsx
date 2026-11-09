import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "@/api";
import { formatCurrency } from "@/lib/expiry";
import { VehicleLoading } from "@/components/common/VehicleLoading";

export default function PricingPage() {
  const {
    data: plans,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: paymentApi.plans,
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
          <div className="rounded-2xl border bg-white">
            <VehicleLoading variant="section" />
          </div>
        ) : isError || !plans ? (
          <p
            role="alert"
            className="rounded-2xl border border-destructive/40 bg-white p-8 text-center text-destructive"
          >
            Pricing could not be loaded. Please try again later.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans?.map((plan) => {
              return (
                <article
                  key={plan.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">
                    {plan.description}
                  </p>
                  <div className="mt-5 space-y-2">
                    <p className="text-base text-slate-500 line-through">
                      {formatCurrency(plan.original_price)}
                    </p>
                    {plan.offer_tag && (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                        {plan.offer_tag}
                      </span>
                    )}
                    <p className="text-3xl font-extrabold text-slate-900">
                      Now {formatCurrency(plan.current_price)}
                    </p>
                    <p className="text-sm font-medium text-slate-500">/ year</p>
                  </div>
                  <Link
                    to={`/renewal?plan=${plan.id}#payment-section`}
                    className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 px-4 py-2 text-sm font-bold text-white transition hover:shadow-lg"
                  >
                    Choose Plan
                  </Link>
                </article>
              );
            })}
            {plans?.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-slate-600">
                Subscription plans are not available right now.
              </p>
            )}
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
