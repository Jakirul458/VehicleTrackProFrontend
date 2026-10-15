import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/pages/auth";
import { authApi } from "@/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Start your free trial — VehicleTrack Pro" },
      { name: "description", content: "Create your VehicleTrack Pro account and get 7 days free." },
      { property: "og:title", content: "Start your free trial — VehicleTrack Pro" },
      { property: "og:description", content: "7 days free. No card needed." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  return (
    <AuthLayout title="Create your account" subtitle="7-day free trial. No card required.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const mobile = String(f.get("mobile") ?? "").trim();
          const password = String(f.get("password") ?? "");
          if (!/^\+?[0-9]{10,15}$/.test(mobile)) { toast.error("Enter a valid mobile number"); return; }
          if (password.length < 12) { toast.error("Password must be at least 12 characters"); return; }
          void authApi.register({
            fullName: String(f.get("fullName") ?? "").trim(),
            businessName: String(f.get("businessName") ?? "").trim(),
            mobile,
            email: String(f.get("email") ?? "").trim(),
            password,
          }).then((user) => {
            signIn(user);
            toast.success("Account created — welcome!");
            void navigate({ to: "/dashboard" });
          }).catch((error: { message?: string }) => toast.error(error.message ?? "Could not create your account"));
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="fullName">Full name</Label><Input id="fullName" name="fullName" required /></div>
          <div className="space-y-1.5"><Label htmlFor="businessName">Business name</Label><Input id="businessName" name="businessName" required /></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="mobile">Mobile</Label><Input id="mobile" name="mobile" inputMode="tel" maxLength={16} required /></div>
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={12} required /></div>
        <Button type="submit" className="w-full">Start free trial</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-medium text-primary">Sign in</Link></p>
    </AuthLayout>
  );
}
