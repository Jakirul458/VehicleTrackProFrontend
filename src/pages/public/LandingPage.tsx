import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Shield,
  Bell,
  BarChart3,
  Users,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText,
  Coffee,
  Wrench,
  Store,
  Truck,
  BadgeCheck,
  Sparkles,
  Siren,
  FileSearch,
  Receipt,
  MessageCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

// Fades/slides an element in once it scrolls into view
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`vt-reveal ${shown ? "vt-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// Counts a number up when it becomes visible
function CountUp({
  to,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setValue(to);
      return;
    }
    let raf: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Car,
    title: "Insurance Tracking",
    text: "Keep policy details, payment information and renewal dates together.",
    grad: "from-indigo-500 to-blue-500",
    glow: "hover:shadow-indigo-500/30",
    ring: "group-hover:border-indigo-400/60",
  },
  {
    icon: Shield,
    title: "Tax and PUC Tracking",
    text: "Track road tax and PUC details with automatic expiry dates.",
    grad: "from-emerald-500 to-teal-500",
    glow: "hover:shadow-emerald-500/30",
    ring: "group-hover:border-emerald-400/60",
  },
  {
    icon: Bell,
    title: "Expiry Alerts",
    text: "Get a reminder before a document expires, so no renewal deadline slips by.",
    grad: "from-amber-500 to-orange-500",
    glow: "hover:shadow-amber-500/30",
    ring: "group-hover:border-amber-400/60",
  },
  {
    icon: MessageCircle,
    title: "One-tap WhatsApp reminders",
    text: "Open a personalized, ready-to-send WhatsApp reminder when a document is due, and follow up on time.",
    grad: "from-green-500 to-emerald-500",
    glow: "hover:shadow-green-500/30",
    ring: "group-hover:border-green-400/60",
  },
  {
    icon: BarChart3,
    title: "Expiry Overview",
    text: "See document statuses and upcoming renewals at a glance.",
    grad: "from-fuchsia-500 to-pink-500",
    glow: "hover:shadow-fuchsia-500/30",
    ring: "group-hover:border-fuchsia-400/60",
  },
  {
    icon: Users,
    title: "Start with a free trial",
    text: "Sign up and try all document features free for one month. Super Admins can also create agent accounts.",
    grad: "from-cyan-500 to-sky-500",
    glow: "hover:shadow-cyan-500/30",
    ring: "group-hover:border-cyan-400/60",
  },
  {
    icon: Lock,
    title: "Secure & Reliable",
    text: "Role-based access control and encrypted data keep your customer records safe.",
    grad: "from-violet-500 to-purple-500",
    glow: "hover:shadow-violet-500/30",
    ring: "group-hover:border-violet-400/60",
  },
];

const audiences = [
  {
    icon: BadgeCheck,
    title: "Insurance Agents",
    text: "Track policy renewals and keep customer details with each record.",
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300",
    bar: "bg-indigo-500",
  },
  {
    icon: Coffee,
    title: "Cyber Cafés",
    text: "Offer vehicle document services with neat, searchable record-keeping.",
    color: "text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  {
    icon: Wrench,
    title: "Vehicle Service Centers",
    text: "Monitor document compliance for every vehicle that comes in for service.",
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  {
    icon: FileText,
    title: "Document Service Providers",
    text: "Streamline vehicle paperwork for all of your clients.",
    color: "text-pink-600 bg-pink-100 dark:bg-pink-500/20 dark:text-pink-300",
    bar: "bg-pink-500",
  },
  {
    icon: Store,
    title: "Small Vehicle Businesses",
    text: "Manage fleet documentation and compliance without spreadsheets.",
    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-300",
    bar: "bg-cyan-500",
  },
  {
    icon: Truck,
    title: "Fleet Operators",
    text: "Keep every document across your whole fleet in one view.",
    color: "text-violet-600 bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300",
    bar: "bg-violet-500",
  },
];

const steps = [
  {
    title: "Enter document details",
    text: "Keep customer and vehicle details with each document record.",
    grad: "from-indigo-500 to-violet-500",
  },
  {
    title: "Record the documents",
    text: "Add insurance, road tax, and PUC dates.",
    grad: "from-pink-500 to-rose-500",
  },
  {
    title: "Renew on time",
    text: "Alerts tell you what expires soon, so you can call the customer first.",
    grad: "from-amber-500 to-orange-500",
  },
];

const docChips = [
  { label: "Insurance", c: "bg-indigo-500" },
  { label: "Road Tax", c: "bg-emerald-500" },
  { label: "PUC", c: "bg-amber-500" },
];

const stats = [
  { to: 3, suffix: "", label: "Document types tracked" },
  { to: 30, suffix: " days", label: "Advance expiry alerts" },
  { to: 100, suffix: "%", label: "Records in one place" },
  { to: 24, suffix: "/7", label: "Access from any device" },
];

/* ------------------------------------------------------------------ */
/*  Hero preview card (decorative product mock)                        */
/* ------------------------------------------------------------------ */

function PreviewCard() {
  const rows = [
    {
      name: "Insurance",
      note: "Valid till 14 Mar 2027",
      status: "Active",
      dot: "bg-emerald-400",
      chip: "bg-emerald-400/15 text-emerald-300",
    },
    {
      name: "Road Tax",
      note: "Valid till 02 Jan 2027",
      status: "Active",
      dot: "bg-emerald-400",
      chip: "bg-emerald-400/15 text-emerald-300",
    },
    {
      name: "PUC",
      note: "Expires in 5 days",
      status: "Renew soon",
      dot: "bg-amber-400",
      chip: "bg-amber-400/15 text-amber-300",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="vt-float rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-fuchsia-900/40 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 text-white">
            <Car className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">WB 56 AB 1234</p>
            <p className="truncate text-sm text-white/60">Maruti Swift · Rahim Sheikh</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {rows.map((r, i) => (
            <li
              key={r.name}
              style={{ animationDelay: `${600 + i * 180}ms` }}
              className="vt-pop flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3.5 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`relative h-2.5 w-2.5 shrink-0 rounded-full ${r.dot}`}>
                  {r.status !== "Active" && (
                    <span className={`vt-ping absolute inset-0 rounded-full ${r.dot}`} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{r.name}</p>
                  <p className="truncate text-xs text-white/55">{r.note}</p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${r.chip}`}>
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* floating notification */}
      <div className="vt-float-slow absolute -bottom-6 -left-2 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-8">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">PUC expiring</p>
          <p className="text-xs text-slate-500">Reminder sent to customer</p>
        </div>
      </div>

      <div
        className="vt-float-slow absolute -right-2 -top-5 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl sm:-right-6"
        style={{ animationDelay: "-2s" }}
      >
        <CheckCircle className="h-5 w-5 text-emerald-500" />
        <span className="text-sm font-semibold text-slate-900">Insurance renewed</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Road check banner: vehicle gets stopped, papers checked, fined      */
/* ------------------------------------------------------------------ */

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy="34" r="8" fill="#0f172a" />
      <g className="vt-wheel">
        <circle cx={cx} cy="34" r="4.5" fill="#cbd5e1" />
        <line x1={cx - 4} y1="34" x2={cx + 4} y2="34" stroke="#475569" strokeWidth="1.5" />
        <line x1={cx} y1="30" x2={cx} y2="38" stroke="#475569" strokeWidth="1.5" />
      </g>
    </g>
  );
}

function CarSvg() {
  return (
    <svg viewBox="0 0 96 44" className="h-11 w-24" aria-hidden="true">
      <path
        d="M4 32 L6 22 Q8 17 14 17 H30 L38 6 Q40 4 44 4 H64 Q68 4 71 7 L78 17 H86 Q92 18 92 25 V32 Z"
        fill="#f59e0b"
      />
      <path d="M34 17 L41 8 H51 V17 Z" fill="#bae6fd" />
      <path d="M55 17 V8 H63 L70 17 Z" fill="#bae6fd" />
      <rect x="88" y="22" width="4" height="4" rx="1" fill="#fef9c3" />
      <Wheel cx={24} />
      <Wheel cx={72} />
    </svg>
  );
}

function BikeSvg() {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden="true">
      {/* rider */}
      <path d="M27 19 L36 9" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
      <path d="M37 10 L46 15" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
      <circle cx="38" cy="4" r="5" fill="#fcd9b6" />
      <path d="M32.5 4 Q38 -4 43.5 4 Z" fill="#ec4899" />
      {/* bike body */}
      <path d="M12 30 L22 21 H40 L50 27 L52 31 H12 Z" fill="#ec4899" />
      <rect x="20" y="18" width="14" height="3.5" rx="1.5" fill="#0f172a" />
      <path d="M50 27 L46 14" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M43 14 H50" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <rect x="55" y="22" width="3" height="4" rx="1" fill="#fef9c3" />
      <Wheel cx={14} />
      <Wheel cx={52} />
    </svg>
  );
}

function PoliceCarSvg() {
  return (
    <svg viewBox="0 0 96 44" className="h-11 w-24 -scale-x-100" aria-hidden="true">
      <path
        d="M4 32 L6 22 Q8 17 14 17 H30 L38 6 Q40 4 44 4 H64 Q68 4 71 7 L78 17 H86 Q92 18 92 25 V32 Z"
        fill="#f8fafc"
      />
      <rect x="6" y="24" width="86" height="5" fill="#1d4ed8" />
      <path d="M34 17 L41 8 H51 V17 Z" fill="#93c5fd" />
      <path d="M55 17 V8 H63 L70 17 Z" fill="#93c5fd" />
      <rect x="44" y="0" width="8" height="4" rx="1" className="vt-light-a" fill="#ef4444" />
      <rect x="53" y="0" width="8" height="4" rx="1" className="vt-light-b" fill="#3b82f6" />
      <Wheel cx={24} />
      <Wheel cx={72} />
    </svg>
  );
}

function OfficerSvg() {
  return (
    <svg viewBox="0 0 36 62" className="h-14 w-8" aria-hidden="true">
      {/* raised stop arm */}
      <path d="M8 24 L2 10" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="2" cy="8" r="3.5" fill="#fcd9b6" />
      {/* body */}
      <rect x="9" y="22" width="18" height="20" rx="4" fill="#1e3a8a" />
      <rect x="9" y="30" width="18" height="3" fill="#facc15" />
      <path d="M27 26 L31 40" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
      {/* legs */}
      <rect x="11" y="42" width="6" height="16" rx="2" fill="#0f172a" />
      <rect x="19" y="42" width="6" height="16" rx="2" fill="#0f172a" />
      {/* head + cap */}
      <circle cx="18" cy="14" r="6.5" fill="#fcd9b6" />
      <path d="M10.5 12 Q18 2 25.5 12 Z" fill="#1e3a8a" />
      <rect x="10" y="11" width="16" height="2.5" fill="#0f172a" />
    </svg>
  );
}

function RoadBanner() {
  const bubble =
    "absolute bottom-[70px] right-[104px] z-20 flex items-center gap-2 whitespace-nowrap rounded-2xl px-3.5 py-2 text-xs font-semibold shadow-xl sm:text-sm opacity-0";

  return (
    <section
      aria-label="Animation: a vehicle is stopped on the road and fined for an expired document"
      className="relative isolate overflow-hidden bg-gradient-to-b from-sky-900 via-indigo-900 to-slate-950"
    >
      <div className="relative mx-auto h-32 w-full">
        {/* caption */}
        <div className="absolute left-4 top-3 z-10 hidden max-w-[40%] sm:block lg:left-8">
          <p className="text-sm font-semibold text-white">One expired document is all it takes.</p>
          <p className="text-xs text-white/65">Track every renewal with VehicleTrack Pro.</p>
        </div>

        {/* road */}
        <div className="absolute inset-x-0 bottom-0 h-11 border-t-4 border-slate-600 bg-slate-800">
          <div
            className="absolute inset-x-0 top-1/2 h-[3px]"
            style={{
              backgroundImage: "linear-gradient(90deg, #fbbf24 50%, transparent 50%)",
              backgroundSize: "56px 3px",
            }}
          />
        </div>

        {/* police car + officer */}
        <div className="absolute bottom-2 right-2 z-10">
          <PoliceCarSvg />
        </div>
        <div className="absolute bottom-2 right-[104px] z-10">
          <OfficerSvg />
        </div>

        {/* driving vehicle */}
        <div className="vt-bike absolute bottom-2 z-10" style={{ left: "-200px" }}>
          <BikeSvg />
        </div>
        <div className="vt-car absolute bottom-2 z-10" style={{ left: "-130px" }}>
          <CarSvg />
        </div>

        {/* speech bubbles (shown one after another) */}
        <div className={`vt-b1 ${bubble} bg-white text-slate-900`}>
          <Siren className="h-4 w-4 text-blue-600" />
          Stop! Show your papers
        </div>
        <div className={`vt-b2 ${bubble} bg-amber-300 text-amber-950`}>
          <FileSearch className="h-4 w-4" />
          Insurance expired
        </div>
        <div className={`vt-b3 ${bubble} bg-rose-600 text-white`}>
          <Receipt className="h-4 w-4" />
          Fine issued: ₹2,000
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* All custom animations live here so no tailwind.config change is needed */}
      <style>{`
        @keyframes vt-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.12); }
          66% { transform: translate(-35px, 30px) scale(0.92); }
        }
        @keyframes vt-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes vt-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes vt-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes vt-pop {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vt-ping {
          0% { transform: scale(1); opacity: 0.7; }
          80%, 100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes vt-rise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vt-blob { animation: vt-blob 14s ease-in-out infinite; }
        .vt-float { animation: vt-float 6s ease-in-out infinite; }
        .vt-float-slow { animation: vt-float 8s ease-in-out infinite; }
        .vt-gradient-text,
        .vt-gradient-bg { background-size: 220% 220%; animation: vt-gradient 8s ease infinite; }
        .vt-marquee { animation: vt-marquee 28s linear infinite; }
        .vt-marquee-wrap:hover .vt-marquee { animation-play-state: paused; }
        .vt-pop { opacity: 0; animation: vt-pop 0.6s ease-out forwards; }
        .vt-ping { animation: vt-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .vt-hero-in { opacity: 0; animation: vt-rise 0.8s ease-out forwards; }
        .vt-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .vt-reveal.vt-in { opacity: 1; transform: translateY(0); }

        @keyframes vt-drive {
          0% { left: -130px; animation-timing-function: cubic-bezier(0.1, 0.7, 0.3, 1); }
          24% { left: calc(100% - 240px); }
          80% { left: calc(100% - 240px); animation-timing-function: ease-in; }
          100% { left: 108%; }
        }
        @keyframes vt-drive-bike {
          0% { left: -200px; animation-timing-function: cubic-bezier(0.1, 0.7, 0.3, 1); }
          24% { left: calc(100% - 330px); }
          82% { left: calc(100% - 330px); animation-timing-function: ease-in; }
          100% { left: 108%; }
        }
        @keyframes vt-spin { to { transform: rotate(360deg); } }
        @keyframes vt-light-a { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
        @keyframes vt-light-b { 0%, 49% { opacity: 0.15; } 50%, 100% { opacity: 1; } }
        @keyframes vt-b1 {
          0%, 25% { opacity: 0; transform: translate(0, 8px) scale(0.9); }
          28%, 41% { opacity: 1; transform: translate(0, 0) scale(1); }
          44%, 100% { opacity: 0; transform: translate(0, -6px) scale(0.95); }
        }
        @keyframes vt-b2 {
          0%, 43% { opacity: 0; transform: translate(0, 8px) scale(0.9); }
          46%, 59% { opacity: 1; transform: translate(0, 0) scale(1); }
          62%, 100% { opacity: 0; transform: translate(0, -6px) scale(0.95); }
        }
        @keyframes vt-b3 {
          0%, 61% { opacity: 0; transform: translate(0, 8px) scale(0.9); }
          64%, 78% { opacity: 1; transform: translate(0, 0) scale(1); }
          81%, 100% { opacity: 0; transform: translate(0, -6px) scale(0.95); }
        }
        .vt-car { animation: vt-drive 14s infinite; }
        .vt-bike { animation: vt-drive-bike 14s infinite; }
        .vt-wheel { transform-box: fill-box; transform-origin: center; animation: vt-spin 0.6s linear infinite; }
        .vt-light-a { animation: vt-light-a 0.5s steps(1) infinite; }
        .vt-light-b { animation: vt-light-b 0.5s steps(1) infinite; }
        .vt-b1 { animation: vt-b1 14s infinite; }
        .vt-b2 { animation: vt-b2 14s infinite; }
        .vt-b3 { animation: vt-b3 14s infinite; }

        @media (prefers-reduced-motion: reduce) {
          .vt-blob, .vt-float, .vt-float-slow, .vt-gradient-text, .vt-gradient-bg,
          .vt-marquee, .vt-ping { animation: none !important; }
          .vt-pop, .vt-hero-in { animation: none !important; opacity: 1 !important; }
          .vt-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          .vt-car { animation: none !important; left: calc(100% - 240px) !important; }
          .vt-bike { animation: none !important; left: calc(100% - 330px) !important; }
          .vt-wheel, .vt-light-a, .vt-light-b { animation: none !important; }
          .vt-b1, .vt-b2 { animation: none !important; opacity: 0 !important; }
          .vt-b3 { animation: none !important; opacity: 1 !important; transform: translate(0, 0) !important; }
        }
      `}</style>

      <RoadBanner />

      {/* ============================ HERO ============================ */}
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 pb-12 pt-8 sm:pt-10 lg:pt-12">
        {/* colour blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="vt-blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/50 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
          <div
            className="vt-blob absolute right-0 top-10 h-72 w-72 rounded-full bg-fuchsia-600/40 blur-3xl sm:h-96 sm:w-96"
            style={{ animationDelay: "-4s" }}
          />
          <div
            className="vt-blob absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl"
            style={{ animationDelay: "-8s" }}
          />
          <div
            className="vt-blob absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-amber-500/25 blur-3xl"
            style={{ animationDelay: "-11s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="container mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div
              className="vt-hero-in mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Built for agents, cafés and fleet owners
            </div>

            <h1
              className="vt-hero-in mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
              style={{ animationDelay: "120ms" }}
            >
              Manage Vehicle Documents{" "}
              <span className="vt-gradient-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
                Smarter
              </span>
            </h1>

            <p
              className="vt-hero-in mx-auto mb-6 max-w-xl text-base text-white/75 sm:text-lg lg:mx-0"
              style={{ animationDelay: "240ms" }}
            >
              Track insurance, road tax, and PUC expiry dates from one simple platform.
            </p>

            <div
              className="vt-hero-in flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
              style={{ animationDelay: "360ms" }}
            >
              <Link
                to="/signup"
                className="vt-gradient-bg group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-600/30 transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300/60"
              >
                Start one-month free trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Sign In
              </Link>
            </div>

            <ul
              className="vt-hero-in mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70 lg:justify-start"
              style={{ animationDelay: "480ms" }}
            >
              {["Insurance, tax and PUC", "Works on mobile", "Role-based access"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="vt-hero-in pb-4" style={{ animationDelay: "300ms" }}>
            <PreviewCard />
          </div>
        </div>
      </section>

      {/* ======================= DOCUMENT MARQUEE ======================= */}
      <section className="border-y border-slate-200 bg-slate-50 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="vt-marquee-wrap overflow-hidden">
          <div className="vt-marquee flex w-max gap-4 pr-4">
            {[...docChips, ...docChips].map((d, i) => (
              <span
                key={i}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${d.c}`} />
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== STATS ========================== */}
      <section className="px-4 py-10">
        <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => {
            const colors = [
              "from-indigo-500 to-violet-500",
              "from-pink-500 to-rose-500",
              "from-amber-500 to-orange-500",
              "from-emerald-500 to-cyan-500",
            ];
            return (
              <Reveal key={s.label} delay={i * 90} className="text-center">
                <p
                  className={`bg-gradient-to-r ${colors[i]} bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl`}
                >
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.label}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ======================== FEATURES ======================== */}
      <section
        id="features"
        className="scroll-mt-20 relative bg-slate-50 px-4 py-12 sm:py-14 lg:py-16 dark:bg-slate-900/60"
      >
        <div className="container mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-9 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Powerful Features</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to keep customer vehicles legal and renewals on schedule.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 100}
                className={i === features.length - 1 ? "lg:col-start-2" : ""}
              >
                <div
                  className={`group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${f.glow} ${f.ring} dark:border-slate-800 dark:bg-slate-900`}
                >
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.grad} text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= HOW IT WORKS ======================= */}
      <section className="px-4 py-14">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="mx-auto mb-9 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Up and running in three steps</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No training needed. Add your data and the reminders start working.
            </p>
          </Reveal>

          <div className="relative grid gap-8 md:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden h-0.5 bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-400 md:block"
            />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 150} className="relative text-center">
                <div
                  className={`relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${s.grad} text-2xl font-bold text-white shadow-lg ring-8 ring-white dark:ring-slate-950`}
                >
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="mx-auto max-w-xs text-slate-600 dark:text-slate-400">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= WHO IT'S FOR ======================= */}
      <section className="bg-slate-50 px-4 py-14 dark:bg-slate-900/60">
        <div className="container mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-9 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Who It's For</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              If you handle other people's vehicle paperwork, this was made for you.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((a, i) => (
              <Reveal key={a.title} delay={(i % 3) * 100}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <span
                    className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${a.bar}`}
                  />
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${a.color}`}
                  >
                    <a.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-semibold">{a.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{a.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-8 bg-white px-4 py-16 dark:bg-slate-950">
        <Reveal className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 text-center shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
              Simple annual pricing
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              One month free, then one year for ₹3,650
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
              Try Insurance, Road Tax and PUC tracking free for one month. To continue after your
              trial, contact admin to purchase the annual plan and extend your account validity.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Start free trial
              </Link>
              <a
                href="tel:6294527072"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:border-indigo-500 hover:text-indigo-700 dark:border-slate-700 dark:text-white"
              >
                Contact admin: 6294527072
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="px-4 py-14">
        <Reveal>
          <div className="vt-gradient-bg relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500 px-6 py-12 text-center shadow-2xl shadow-fuchsia-600/30 sm:px-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="vt-blob absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
              <div
                className="vt-blob absolute -bottom-12 right-0 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl"
                style={{ animationDelay: "-6s" }}
              />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
              Join professionals managing vehicle documents smarter with VehicleTrack Pro.
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-semibold text-fuchsia-700 shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
