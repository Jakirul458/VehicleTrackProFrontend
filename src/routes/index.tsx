import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, MessageCircle, Receipt, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common";
import { APP_NAME, APP_TAGLINE, PLANS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VehicleTrack Pro — Vehicle Insurance & Tax Management" },
      { name: "description", content: "Track insurance policies, road tax payments, and renewal dates for every customer." },
      { property: "og:title", content: "VehicleTrack Pro — Never Miss an Expiry" },
      { property: "og:description", content: "Insurance and tax expiry management for agents and service businesses." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ShieldCheck, title: "Insurance", text: "Policies, premiums and renewal dates." },
  { icon: Receipt, title: "Road tax", text: "Quarterly, yearly or lifetime tax tracking." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Truck className="size-5" /></div>
            <span className="font-display font-bold">{APP_NAME}</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/register">Start free trial</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="absolute -right-40 -top-40 size-136 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-navy-foreground/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-glow">For agents, cyber cafés & RTO services</p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">{APP_TAGLINE}</h1>
            <p className="mt-5 max-w-lg text-lg text-navy-foreground/75">Manage customers, insurance policies and vehicle tax records with clear renewal and expiry tracking.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/register">Start 7-day free trial</Link></Button>
              <Button size="lg" variant="outline" className="border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10" asChild><Link to="/login">View demo</Link></Button>
            </div>
          </div>
          <div className="rounded-2xl border border-navy-foreground/10 bg-card p-5 text-card-foreground shadow-elevated">
            <div className="mb-4 flex items-center justify-between"><p className="font-display font-semibold">Upcoming expiries</p><Bell className="size-4 text-muted-foreground" /></div>
            {[
              ["Rocky Bhai", "Insurance · WB58P3104", "URGENT", "5d"],
              ["Priya Sharma", "Road Tax · WB41C3652", "DUE_SOON", "22d"],
              ["Tapan Roy", "Insurance · WB74E4063", "EXPIRED", "6d overdue"],
              ["Kabir Ali", "Road Tax · WB58P3104", "ACTIVE", "96d"],
            ].map(([n, d, s, l]) => (
              <div key={n} className="flex items-center justify-between border-t border-border py-3">
                <div><p className="font-medium">{n}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                <div className="flex items-center gap-2"><StatusBadge status={s as "ACTIVE"} label={l} /><MessageCircle className="size-4 text-status-active" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center font-display text-3xl font-bold">Insurance and tax, tracked</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">Status is always worked out from the expiry date, so nothing slips through.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="grid size-11 place-items-center rounded-lg bg-accent text-accent-foreground"><f.icon className="size-5" /></div>
              <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-bold">Simple pricing</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={cn("flex flex-col rounded-2xl border bg-card p-6 shadow-card", p.highlighted ? "border-primary shadow-glow" : "border-border")}>
                {p.highlighted && <span className="mb-3 w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">Most popular</span>}
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-5"><span className="font-display text-4xl font-bold">{p.price}</span> <span className="text-sm text-muted-foreground">{p.period}</span></p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="size-4 shrink-0 text-status-active" />{f}</li>)}
                </ul>
                <Button className="mt-6" variant={p.highlighted ? "default" : "outline"} asChild><Link to="/register">{p.cta}</Link></Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} {APP_NAME}</span>
        <span>Vehicle Insurance & Tax Management System</span>
      </footer>
    </div>
  );
}
