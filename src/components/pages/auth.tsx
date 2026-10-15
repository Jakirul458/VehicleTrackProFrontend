import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Truck } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/constants/navigation";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-10 text-navy-foreground lg:flex">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Truck className="size-5" /></div>
          <span className="font-display text-lg font-bold">{APP_NAME}</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">{APP_TAGLINE}</h2>
          <ul className="mt-8 space-y-3 text-navy-foreground/80">
            {["Insurance policies and tax records in one place", "Clear expiry and renewal tracking", "Customer records for every policy"].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-5 text-primary-glow" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-navy-muted">Built for insurance agents, cyber cafés and RTO service providers.</p>
      </div>
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
