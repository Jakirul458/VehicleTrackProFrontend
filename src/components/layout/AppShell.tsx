import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { authApi } from "@/api/authApi";
import { APP_NAME, type NavGroup } from "@/constants/navigation";
import type { Role } from "@/types";

function Sidebar({ nav, onNavigate }: { nav: NavGroup[]; onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      <Link to="/" className="flex items-center gap-2.5 px-2" onClick={onNavigate}>
        <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
          <Truck className="size-5" />
        </div>
        <span className="font-display text-base font-bold text-navy-foreground">{APP_NAME}</span>
      </Link>
      {nav.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-navy-muted">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy-foreground/75 transition-colors hover:bg-navy-foreground/10 hover:text-navy-foreground"
                  activeProps={{ className: "bg-primary/90 !text-primary-foreground shadow-glow" }}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ nav, role, children }: { nav: NavGroup[]; role: Role; children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const allowed =
    user && user.role === role;

  useEffect(() => {
    if (isLoading) return;
    if (!user) void navigate({ to: "/login", replace: true });
    else if (!allowed) void navigate({ to: user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/dashboard", replace: true });
  }, [isLoading, user, allowed, navigate]);

  if (isLoading || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy lg:block">
        <Sidebar nav={nav} />
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy">
            <button
              className="absolute right-3 top-4 text-navy-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <Sidebar nav={nav} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.businessName ?? user.fullName}
            </p>
            <p className="text-xs text-muted-foreground">{role === "SUPER_ADMIN" ? "Super Admin" : "Agent workspace"}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <span className="hidden text-sm font-medium md:block">{user.fullName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => {
              void authApi.logout().catch(() => undefined).finally(() => {
                signOut();
                void navigate({ to: "/login", replace: true });
              });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </header>
        <main className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8")}>{children}</main>
      </div>
    </div>
  );
}
