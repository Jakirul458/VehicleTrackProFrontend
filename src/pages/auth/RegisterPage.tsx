import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { Truck, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    businessName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 12) {
      toast.error('Password must be at least 12 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.publicRegister({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        businessName: formData.businessName,
      });
      updateUser(response.user);
      toast.success('Registration successful! Welcome to your 7-day free trial.');
      navigate('/agent/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <style>{`
        @keyframes vt-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes vt-gradient { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .vt-float { animation: vt-float 6s ease-in-out infinite; }
        .vt-grad-text {
          background: linear-gradient(90deg, #4f46e5, #ec4899, #f97316, #4f46e5);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: vt-gradient 6s linear infinite;
        }
      `}</style>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="vt-float inline-flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4 shadow-lg">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
          <p className="text-slate-600">7 days full access, no credit card required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-2xl shadow-xl">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="ABC Agency"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-11"
                placeholder="Min 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-11"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-orange-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Start Free Trial'
            )}
          </button>
        </form>

        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-emerald-800">
              <p className="font-semibold mb-1">What you get:</p>
              <ul className="space-y-1 text-emerald-700">
                <li>• 7 days full access to all features</li>
                <li>• Unlimited customers & vehicles</li>
                <li>• Document expiry alerts</li>
                <li>• No credit card required</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
