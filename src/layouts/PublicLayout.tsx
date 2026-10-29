import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function PublicLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = ["/login", "/signup", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {!isAuthPage && (
        <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-slate-800 dark:bg-slate-950/95">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex min-h-16 items-center justify-between gap-3">
              <Link
                to="/"
                className="flex min-w-0 items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20">
                  <span className="text-lg font-bold text-white">V</span>
                </div>
                <span className="truncate text-base font-bold tracking-tight sm:text-lg">
                  VehicleTrack Pro
                </span>
              </Link>

              <div className="hidden items-center gap-4 lg:flex">
                <Link
                  to="/"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Start free trial
                </Link>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="public-mobile-navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div
                id="public-mobile-navigation"
                className="grid gap-1 border-t border-slate-200 py-3 lg:hidden dark:border-slate-800"
              >
                <Link
                  to="/"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold dark:border-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}
      <Outlet />
      {!isAuthPage && (
        <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-300">
          <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
              <div className="sm:col-span-2 lg:col-span-1">
                <Link to="/" className="mb-4 inline-flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400">
                    <span className="text-lg font-bold text-white">V</span>
                  </div>
                  <span className="text-lg font-bold text-white">VehicleTrack Pro</span>
                </Link>
                <p className="max-w-sm text-sm leading-6 text-slate-400">
                  Professional vehicle document management system for insurance agents and service
                  providers.
                </p>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-white">Product</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <Link to="/#features" className="transition-colors hover:text-cyan-300">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/#pricing" className="transition-colors hover:text-cyan-300">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="transition-colors hover:text-cyan-300">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-white">Company</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <Link to="/about" className="transition-colors hover:text-cyan-300">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="transition-colors hover:text-cyan-300">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-white">Legal</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>
                    <Link to="/about" className="transition-colors hover:text-cyan-300">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="transition-colors hover:text-cyan-300">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; {new Date().getFullYear()} VehicleTrack Pro. All rights reserved.</p>
              <p>Made for smarter vehicle document management.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
