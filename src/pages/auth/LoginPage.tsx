import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Truck, CheckCircle2, Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { normalizeApiError, type NormalizedApiError } from "@/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FEATURES = [
  "Insurance, tax and PUC records in one place",
  "Colour-coded expiry alerts",
  "One-tap WhatsApp reminders",
];

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<NormalizedApiError | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const trialExpired = new URLSearchParams(location.search).get("expired") === "1";
  const validityExpired =
    trialExpired ||
    loginError?.code === "ACCOUNT_VALIDITY_EXPIRED" ||
    (loginError?.status === 403 && loginError.code !== "ACCOUNT_SUSPENDED");
  const invalidCredentials =
    loginError?.code === "INVALID_CREDENTIALS" ||
    loginError?.status === 401 ||
    loginError?.status === 422;

  const doLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await login(email, password);
      toast.success("Login successful!");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "SUPER_ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/agent/dashboard", { replace: true });
      }
    } catch (error) {
      setLoginError(normalizeApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(formData.email, formData.password);
  };

  return (
    <div className="vt-root min-h-screen w-full flex bg-[#eef6ff]">
      <style>{`
        .vt-root { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; }

        @keyframes vt-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.15); } }
        @keyframes vt-float-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-35px) scale(1.2); } }
        @keyframes vt-float-c { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-40px); } }
        @keyframes vt-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vt-gradient { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes vt-drive { 0% { transform: translateX(-60px); opacity: 0; } 10% { opacity: .9; } 90% { opacity: .9; } 100% { transform: translateX(520px); opacity: 0; } }
        @keyframes vt-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(0,128,200,.45); } 100% { box-shadow: 0 0 0 18px rgba(0,128,200,0); } }
        @keyframes vt-sheen { 0% { transform: translateX(-120%); } 100% { transform: translateX(260%); } }
        @keyframes vt-check { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }

        .vt-orb-a { animation: vt-float-a 14s ease-in-out infinite; }
        .vt-orb-b { animation: vt-float-b 18s ease-in-out infinite; }
        .vt-orb-c { animation: vt-float-c 16s ease-in-out infinite; }
        .vt-rise { opacity: 0; animation: vt-rise .7s cubic-bezier(.2,.7,.2,1) forwards; }
        .vt-grad-text {
          background: linear-gradient(90deg, #ffffff, #7dd3fc, #5eead4, #a5b4fc, #ffffff);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: vt-gradient 6s linear infinite;
        }
        .vt-logo { animation: vt-pulse-ring 2.4s ease-out infinite; }
        .vt-truck { animation: vt-drive 7s linear infinite; }
        .vt-check { animation: vt-check 3s ease-in-out infinite; }

        .vt-card {
          background: rgba(255,255,255,.78);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 30px 60px -20px rgba(0,100,170,.25), 0 0 0 1px rgba(255,255,255,.7) inset;
        }

        .vt-btn { position: relative; overflow: hidden; background-size: 200% auto; transition: background-position .5s, transform .15s, box-shadow .2s; }
        .vt-btn:hover:not(:disabled) { background-position: 100% center; box-shadow: 0 14px 28px -10px rgba(0,128,200,.65); }
        .vt-btn:active:not(:disabled) { transform: scale(.985); }
        .vt-btn::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.4), transparent); transform: translateX(-120%); }
        .vt-btn:hover:not(:disabled)::after { animation: vt-sheen .9s ease; }

        .vt-field { transition: border-color .2s, box-shadow .2s, background .2s; }
        .vt-field::placeholder { color: #94a3b8; font-weight: 400; letter-spacing: .01em; }
        .vt-field:focus { border-color: #0080c8; box-shadow: 0 0 0 4px rgba(0,128,200,.14); background: #fff; outline: none; }
        .vt-field-wrap:focus-within .vt-field-icon { color: #0080c8; }

        @media (prefers-reduced-motion: reduce) {
          .vt-root * { animation: none !important; }
          .vt-rise { opacity: 1; }
        }
      `}</style>

      {/* ───────────── LEFT: Brand panel ───────────── */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[#0f1a30] p-12 text-white">
        {/* background glow orbs */}
        <div className="vt-orb-a pointer-events-none absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/30 blur-[110px]" />
        <div className="vt-orb-b pointer-events-none absolute top-1/3 -right-20 h-[320px] w-[320px] rounded-full bg-teal-400/20 blur-[100px]" />
        <div className="vt-orb-c pointer-events-none absolute -bottom-20 -left-10 h-[300px] w-[300px] rounded-full bg-indigo-500/25 blur-[100px]" />
        {/* subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* logo */}
        <div
          className="vt-rise relative z-10 flex items-center gap-3"
          style={{ animationDelay: ".05s" }}
        >
          <div className="vt-logo flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">VehicleTrack Pro</span>
        </div>

        {/* hero */}
        <div className="relative z-10">
          <h2
            className="vt-rise text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight"
            style={{ animationDelay: ".15s" }}
          >
            <span className="vt-grad-text">Track Every Vehicle.</span>
            <br />
            <span className="vt-grad-text">Never Miss an Expiry.</span>
          </h2>

          <ul className="mt-9 space-y-3 max-w-[460px]">
            {FEATURES.map((text, i) => (
              <li
                key={text}
                className="vt-rise flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] text-slate-200 backdrop-blur-sm"
                style={{ animationDelay: `${0.35 + i * 0.12}s` }}
              >
                <CheckCircle2
                  className="vt-check h-5 w-5 shrink-0 text-teal-300"
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
                {text}
              </li>
            ))}
          </ul>

          {/* animated road + truck */}
          <div className="relative mt-12 h-10 max-w-[480px]">
            <div className="absolute bottom-2 left-0 right-0 border-t-2 border-dashed border-white/15" />
            <Truck className="vt-truck absolute bottom-3 h-6 w-6 text-sky-300" />
          </div>
        </div>

        <p
          className="vt-rise relative z-10 text-sm text-slate-400"
          style={{ animationDelay: ".8s" }}
        >
          Built for insurance agents, cyber cafés and RTO service providers.
        </p>
      </div>

      {/* ───────────── RIGHT: Form panel ───────────── */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center overflow-hidden px-5 py-10">
        {/* soft colour blobs */}
        <div className="vt-orb-b pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-sky-300/50 blur-3xl" />
        <div className="vt-orb-a pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-teal-200/50 blur-3xl" />
        <div className="vt-orb-c pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/30 blur-3xl" />

        {/* centered glass card */}
        <div className="vt-card vt-rise relative z-10 w-full max-w-[440px] rounded-[32px] px-7 py-10 sm:px-10">
          {/* centered logo badge */}
          <div className="flex flex-col items-center text-center">
            <div className="vt-logo flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 shadow-xl shadow-sky-500/30">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-5 text-[30px] font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to manage your vehicles and renewals
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="vt-field-wrap relative">
                <Mail className="vt-field-icon pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors" />
                <input
                  type="email"
                  id="email"
                  required
                  autoComplete="username"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="vt-field h-[52px] w-full rounded-full border border-slate-200 bg-slate-50/80 pl-12 pr-5 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="vt-field-wrap relative">
                <Lock className="vt-field-icon pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="vt-field h-[52px] w-full rounded-full border border-slate-200 bg-slate-50/80 pl-12 pr-14 text-sm font-medium text-slate-900"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex justify-end pr-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Please contact your administrator to reset your password.")
                  }
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="vt-btn flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0080c8] via-[#0ea5e9] to-[#0080c8] text-[15px] font-semibold text-white shadow-lg shadow-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            New to VehicleTrack Pro?{" "}
            <Link to="/signup" className="font-semibold text-sky-700 hover:underline">
              Start your 7-day free trial
            </Link>
          </p>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your data is encrypted and secure
          </div>
        </div>
      </div>

      {/* ───────────── Error / expiry dialog ───────────── */}
      <Dialog
        open={trialExpired || Boolean(loginError)}
        onOpenChange={(open) => {
          if (!open) {
            setLoginError(null);
            if (trialExpired) navigate("/login", { replace: true });
          }
        }}
      >
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {validityExpired
                ? "Your account validity has expired"
                : loginError?.code === "ACCOUNT_SUSPENDED"
                  ? "Your account is suspended"
                  : invalidCredentials
                    ? "Email or password is incorrect"
                    : "We couldn't sign you in"}
            </DialogTitle>
            <DialogDescription>
              {validityExpired
                ? "আপনার account-এর validity শেষ হয়ে গেছে। নবায়নের জন্য administrator-এর সাথে যোগাযোগ করুন।"
                : loginError?.code === "ACCOUNT_SUSPENDED"
                  ? "আপনার account suspend করা হয়েছে। সাহায্যের জন্য administrator-এর সাথে যোগাযোগ করুন।"
                  : invalidCredentials
                    ? "আপনার email অথবা password ভুল। সঠিক email ও password দিয়ে আবার চেষ্টা করুন।"
                    : loginError?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            {validityExpired ? (
              <>
                <Link
                  to="/contact"
                  className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium"
                >
                  Contact admin
                </Link>
                <Link
                  to="/renewal"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Renew now · নবায়ন করুন
                </Link>
              </>
            ) : (
              <Link
                to="/contact"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Contact admin
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
