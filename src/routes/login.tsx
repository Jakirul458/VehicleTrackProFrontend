import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/pages/auth";
import { authApi } from "@/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — VehicleTrack Pro" },
      { name: "description", content: "Sign in to manage customers, insurance policies, and tax records." },
      { property: "og:title", content: "Sign in — VehicleTrack Pro" },
      { property: "og:description", content: "Sign in to your VehicleTrack Pro workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in with your email or mobile number.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          void authApi.login({
            identifier: String(form.get("identifier") ?? "").trim(),
            password: String(form.get("password") ?? ""),
          }).then((user) => {
            signIn(user);
            toast.success("Signed in");
            void navigate({ to: user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/dashboard" });
          }).catch((error: { message?: string }) => toast.error(error.message ?? "Could not sign in"));
        }}
      >
        <div className="space-y-1.5"><Label htmlFor="identifier">Email or mobile</Label><Input id="identifier" name="identifier" required /></div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link to="/register" className="font-medium text-primary">Start free trial</Link></p>
    </AuthLayout>
  );
}
