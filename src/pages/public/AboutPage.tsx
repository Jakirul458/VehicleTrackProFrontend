import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  ClipboardList,
  FileCheck2,
  LockKeyhole,
  MessageCircle,
  Users,
} from "lucide-react";

const audiences = [
  "Insurance agents managing policy renewals",
  "Cyber cafés providing vehicle documentation services",
  "Vehicle service centers tracking compliance",
  "Document service providers and fleet operators",
];

const features = [
  {
    icon: ClipboardList,
    title: "One clear workspace",
    description:
      "Keep insurance, road tax and PUC records with their customer and vehicle details.",
    color: "bg-sky-50 text-sky-700",
  },
  {
    icon: BellRing,
    title: "Renewal visibility",
    description:
      "See upcoming and overdue documents in a color-coded view, and plan customer follow-ups.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp follow-up",
    description:
      "Prepare a personalized reminder and open it in WhatsApp when you are ready to send.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: LockKeyhole,
    title: "Role-based access",
    description:
      "Agent accounts work with their own records while Super Admins manage the platform.",
    color: "bg-indigo-50 text-indigo-700",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-slate-50">
      <section className="relative isolate overflow-hidden bg-[#091525] px-4 py-20 text-white sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgba(14,165,233,0.28),transparent_38%),radial-gradient(ellipse_at_85%_85%,rgba(20,184,166,0.2),transparent_34%)]"
        />
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100">
            <BadgeCheck className="h-4 w-4" /> Built for everyday document work
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Less chasing paperwork.
            <span className="mt-2 block bg-gradient-to-r from-cyan-200 to-teal-300 bg-clip-text text-transparent">
              More time for people.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            VehicleTrack Pro brings insurance, road tax and PUC records into one simple workspace,
            helping service professionals keep renewals visible and customers informed.
          </p>
          <Link
            to="/signup"
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5"
          >
            Try it free for one month <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
              A simpler way to stay organized
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Know what is due. Know who to call.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Instead of searching through scattered notes and spreadsheets, keep essential document
              dates and follow-up details close at hand. A dashboard highlights records that need
              attention, and reminders help you act before a renewal is missed.
            </p>
            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <p className="text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">Three document types. One view.</strong>
                <br />
                Insurance, road tax and PUC—ready to review together.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description, color }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/5"
              >
                <span
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">
              Made for your workday
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Who it helps
            </h2>
            <ul className="mt-7 space-y-4">
              {audiences.map((audience) => (
                <li key={audience} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <Check className="h-4 w-4" />
                  </span>
                  {audience}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-teal-50 p-7 ring-1 ring-cyan-100 sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm">
              <Users className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
              A smoother customer follow-up
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              See a document that is due, review its record and prepare a WhatsApp message with
              customer details. You stay in control of when the message is sent.
            </p>
            <Link
              to="/#features"
              className="mt-6 inline-flex items-center gap-2 font-bold text-cyan-800 hover:text-cyan-950"
            >
              Explore the features <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-3xl bg-[#091525] p-8 text-white shadow-xl shadow-slate-900/10 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-300">
              Ready when you are
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Start keeping renewals on track.
            </h2>
            <p className="mt-2 text-slate-300">
              Try the full workflow with a one-month free trial.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-cyan-50"
          >
            Start free trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
