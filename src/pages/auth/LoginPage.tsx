// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
// import { Lock, Mail } from 'lucide-react';
// import { toast } from 'sonner';

// export default function LoginPage() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       await login(formData.email, formData.password);
//       toast.success('Login successful!');
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
//       if (user.role === 'SUPER_ADMIN') {
//         navigate('/admin/dashboard', { replace: true });
//       } else {
//         navigate('/agent/dashboard', { replace: true });
//       }
//     } catch (error) {
//       toast.error('Invalid email or password');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-primary mb-4">
//             <span className="text-primary-foreground font-bold text-3xl">V</span>
//           </div>
//           <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
//           <p className="text-muted-foreground">Sign in to your VehicleTrack Pro account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium mb-2">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <input
//                 type="email"
//                 id="email"
//                 required
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//                 placeholder="your@email.com"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <input
//                 type="password"
//                 id="password"
//                 required
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//                 placeholder="••••••••"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//           >
//             {isSubmitting ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-muted-foreground">
//           <p>Don't have an account? Contact your administrator.</p>
//         </div>
//       </div>
//     </div>
//   );
// }






import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Truck, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeApiError, type NormalizedApiError } from '@/api/client';

// ⚠️ Demo button er jonno credentials — nijer demo account diye change koro
const DEMO_ACCOUNTS = {
  agent: { email: 'agent@demo.com', password: 'agent123' },
  admin: { email: 'admin@demo.com', password: 'admin123' },
};

const FEATURES = [
  'Insurance, tax and PUC records in one place',
  'Colour-coded expiry alerts',
  'One-tap WhatsApp reminders',
];

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<NormalizedApiError | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const trialExpired = new URLSearchParams(location.search).get('expired') === '1';

  const doLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await login(email, password);
      toast.success('Login successful!');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/agent/dashboard', { replace: true });
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

  const handleDemo = async (type: 'agent' | 'admin') => {
    const creds = DEMO_ACCOUNTS[type];
    setFormData(creds);
    await doLogin(creds.email, creds.password);
  };

  return (
    <div className="vt-root min-h-screen w-full flex bg-[#f5f9ff]">
      <style>{`
        .vt-root { font-family: 'Manrope', 'Inter', ui-sans-serif, system-ui, sans-serif; }

        @keyframes vt-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.15); } }
        @keyframes vt-float-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-35px) scale(1.2); } }
        @keyframes vt-float-c { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-40px); } }
        @keyframes vt-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vt-gradient { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes vt-drive { 0% { transform: translateX(-60px); opacity: 0; } 10% { opacity: .9; } 90% { opacity: .9; } 100% { transform: translateX(520px); opacity: 0; } }
        @keyframes vt-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(0,128,200,.45); } 100% { box-shadow: 0 0 0 16px rgba(0,128,200,0); } }
        @keyframes vt-sheen { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
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
        .vt-btn { position: relative; overflow: hidden; background-size: 200% auto; transition: background-position .5s, transform .15s, box-shadow .2s; }
        .vt-btn:hover:not(:disabled) { background-position: 100% center; box-shadow: 0 10px 24px -8px rgba(0,128,200,.6); }
        .vt-btn:active:not(:disabled) { transform: scale(.985); }
        .vt-btn::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent); transform: translateX(-120%); }
        .vt-btn:hover:not(:disabled)::after { animation: vt-sheen .9s ease; }
        .vt-input { transition: border-color .2s, box-shadow .2s, background .2s; }
        .vt-input:focus { border-color: #0080c8; box-shadow: 0 0 0 4px rgba(0,128,200,.15); background: #fff; outline: none; }
        @media (prefers-reduced-motion: reduce) {
          .vt-root * { animation: none !important; }
          .vt-rise { opacity: 1; }
        }
      `}</style>

      {/* ───────────── LEFT: Brand panel ───────────── */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-[#131d33] p-10 text-white">
        {/* background glow orbs */}
        <div className="vt-orb-a pointer-events-none absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/30 blur-[110px]" />
        <div className="vt-orb-b pointer-events-none absolute top-1/3 -right-20 h-[320px] w-[320px] rounded-full bg-teal-400/20 blur-[100px]" />
        <div className="vt-orb-c pointer-events-none absolute -bottom-20 -left-10 h-[300px] w-[300px] rounded-full bg-indigo-500/25 blur-[100px]" />
        {/* subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* logo */}
        <div className="vt-rise relative z-10 flex items-center gap-3" style={{ animationDelay: '.05s' }}>
          <div className="vt-logo flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">VehicleTrack Pro</span>
        </div>

        {/* hero */}
        <div className="relative z-10">
          <h2
            className="vt-rise text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight"
            style={{ animationDelay: '.15s' }}
          >
            <span className="vt-grad-text">Track Every Vehicle.</span>
            <br />
            <span className="vt-grad-text">Never Miss an Expiry.</span>
          </h2>

          <ul className="mt-8 space-y-4">
            {FEATURES.map((text, i) => (
              <li
                key={text}
                className="vt-rise flex items-center gap-3 text-[15px] text-slate-300"
                style={{ animationDelay: `${0.35 + i * 0.12}s` }}
              >
                <CheckCircle2
                  className="vt-check h-5 w-5 shrink-0 text-teal-400"
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

        <p className="vt-rise relative z-10 text-sm text-slate-400" style={{ animationDelay: '.8s' }}>
          Built for insurance agents, cyber cafés and RTO service providers.
        </p>
      </div>

      {/* ───────────── RIGHT: Form panel ───────────── */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center overflow-hidden px-6 py-10">
        {/* soft colour blobs */}
        <div className="vt-orb-b pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="vt-orb-a pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />

        <div className="relative z-10 w-full max-w-[448px]">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">VehicleTrack Pro</span>
          </div>

          <div className="vt-rise" style={{ animationDelay: '.1s' }}>
            <h1 className="text-[32px] font-extrabold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in with your email address.</p>
          </div>

          {(trialExpired || loginError) && (
            <div role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p>
                {loginError?.message ?? 'Your free trial or account validity has ended. Contact admin at 6294527072 to purchase the 1-year plan for ₹4,999 and extend your access.'}
              </p>
              {(trialExpired || loginError?.code === 'ACCOUNT_VALIDITY_EXPIRED') && (
                <a href="tel:6294527072" className="mt-2 inline-block font-semibold underline">
                  Call admin: 6294527072
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="vt-rise" style={{ animationDelay: '.2s' }}>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
                Email address
              </label>
              <input
                type="email"
                id="email"
                required
                autoComplete="username"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="vt-input h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-4 text-sm text-slate-900 shadow-sm"
              />
            </div>

            <div className="vt-rise" style={{ animationDelay: '.3s' }}>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-800">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Please contact your administrator to reset your password.')}
                  className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="vt-input h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-4 pr-11 text-sm text-slate-900 shadow-sm"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="vt-rise" style={{ animationDelay: '.4s' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="vt-btn flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0080c8] via-[#0a94e0] to-[#0080c8] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Preview demo */}
          <div
            className="vt-rise mt-6 rounded-xl border border-dashed border-sky-300/70 bg-white/50 p-4 backdrop-blur-sm"
            style={{ animationDelay: '.5s' }}
          >
            <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500">PREVIEW DEMO</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemo('agent')}
                className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:text-sky-700 hover:shadow-md disabled:opacity-50"
              >
                Agent
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemo('admin')}
                className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:text-violet-700 hover:shadow-md disabled:opacity-50"
              >
                Super Admin
              </button>
            </div>
          </div>

          <p
            className="vt-rise mt-8 text-center text-sm text-slate-500"
            style={{ animationDelay: '.6s' }}
          >
            New to VehicleTrack Pro?{' '}
            <Link to="/signup" className="font-semibold text-sky-700 hover:underline">
              Start your 7-day free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}