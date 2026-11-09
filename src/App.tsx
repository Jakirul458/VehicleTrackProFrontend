import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AgentLayout = lazy(() => import("./layouts/AgentLayout"));
const LandingPage = lazy(() => import("./pages/public/LandingPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const PricingPage = lazy(() => import("./pages/public/PricingPage"));
const RenewalPaymentPage = lazy(() => import("./pages/public/RenewalPaymentPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/public/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/public/TermsOfServicePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const NotFoundPage = lazy(() => import("./pages/errors/NotFoundPage"));
const ForbiddenPage = lazy(() => import("./pages/errors/ForbiddenPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AgentsList = lazy(() => import("./pages/admin/AgentsList"));
const AgentForm = lazy(() => import("./pages/admin/AgentForm"));
const AgentDetails = lazy(() => import("./pages/admin/AgentDetails"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminSubscriptionPlans = lazy(() => import("./pages/admin/AdminSubscriptionPlans"));
const AdminSubscriptionPayments = lazy(() => import("./pages/admin/AdminSubscriptionPayments"));
const AdminSubscriptionInvoices = lazy(() => import("./pages/admin/AdminSubscriptionInvoices"));
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"));
const InsuranceList = lazy(() => import("./pages/agent/InsuranceList"));
const TaxList = lazy(() => import("./pages/agent/TaxList"));
const PucList = lazy(() => import("./pages/agent/PucList"));
const RemindersPage = lazy(() => import("./pages/agent/RemindersPage"));
const AgentReports = lazy(() => import("./pages/agent/AgentReports"));
const AgentProfile = lazy(() => import("./pages/agent/AgentProfile"));
const DocumentModulePage = lazy(() =>
  import("./components/documents/DocumentModulePage").then((module) => ({
    default: module.DocumentModulePage,
  })),
);
const PaymentsPage = lazy(() => import("./pages/agent/PaymentsPage"));
const AgentInvoices = lazy(() => import("./pages/agent/AgentInvoices"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - reduce refetch frequency
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
  },
});

const PAGE_SEO: Record<string, { title: string; description: string; keywords?: string }> = {
  "/": {
    title: "VehicleTrack Pro | Track Every Vehicle. Never Miss an Expiry.",
    description:
      "Keep vehicle insurance, road tax and PUC records together, track upcoming renewals and prepare customer reminders with VehicleTrack Pro.",
    keywords:
      "insurance renewal reminder, road tax tracking, PUC expiry reminder, vehicle document management India",
  },
  "/about": {
    title: "About VehicleTrack Pro | Vehicle Document Management",
    description:
      "Learn how VehicleTrack Pro helps agents and vehicle service providers track insurance, road tax and PUC renewals.",
    keywords: "about VehicleTrack Pro, vehicle service software, insurance agent software",
  },
  "/contact": {
    title: "Contact VehicleTrack Pro | Support & Enquiries",
    description:
      "Contact VehicleTrack Pro for product information, account support and questions about insurance, tax and PUC document management.",
  },
  "/pricing": {
    title: "Pricing | VehicleTrack Pro",
    description:
      "Compare annual Insurance, Road Tax and PUC subscription plans, including discounted service combinations.",
    keywords: "VehicleTrack Pro pricing, insurance tax PUC subscription plans",
  },
  "/privacy-policy": {
    title: "Privacy Policy | VehicleTrack Pro",
    description:
      "Learn how VehicleTrack Pro collects, uses, protects and retains account, customer and vehicle information.",
  },
  "/terms-of-service": {
    title: "Terms of Service | VehicleTrack Pro",
    description:
      "Read the terms for using VehicleTrack Pro vehicle document management and renewal reminder services.",
  },
};

function SeoManager() {
  const { pathname: currentPath } = useLocation();
  const pathname = currentPath.replace(/\/+$/, "") || "/";

  useEffect(() => {
    const page = PAGE_SEO[pathname];
    const isPrivateOrAuth = !page;
    const title =
      page?.title ??
      (pathname === "/login"
        ? "Sign in | VehicleTrack Pro"
        : ["/signup", "/register"].includes(pathname)
          ? "Start your one-month free trial | VehicleTrack Pro"
          : "VehicleTrack Pro");
    const description =
      page?.description ??
      (["/signup", "/register"].includes(pathname)
        ? "Create an account and try Insurance, Tax and PUC tracking free for one month."
        : "Sign in to your VehicleTrack Pro account.");
    const siteUrl = new URL(import.meta.env.VITE_SITE_URL || window.location.origin).origin;
    const canonicalUrl = `${siteUrl}${pathname === "/" ? "/" : pathname}`;

    document.title = title;

    const setMeta = (
      selector: string,
      attribute: "name" | "property",
      key: string,
      content: string,
    ) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.append(element);
      }
      element.content = content;
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      isPrivateOrAuth ? "noindex,nofollow" : "index,follow,max-image-preview:large",
    );
    setMeta(
      'meta[name="googlebot"]',
      "name",
      "googlebot",
      isPrivateOrAuth ? "noindex,nofollow" : "index,follow,max-image-preview:large",
    );
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "VehicleTrack Pro");
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    if (page?.keywords) {
      setMeta('meta[name="keywords"]', "name", "keywords", page.keywords);
    } else {
      document.head.querySelector('meta[name="keywords"]')?.remove();
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (page) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.append(canonical);
      }
      canonical.href = canonicalUrl;
    } else {
      canonical?.remove();
    }
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <SeoManager />
          <Suspense
            fallback={
              <div
                className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                Loading page...
              </div>
            }
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="terms-of-service" element={<TermsOfServicePage />} />
                <Route path="renewal" element={<RenewalPaymentPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="register" element={<SignupPage />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="SUPER_ADMIN">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="agents" element={<AgentsList />} />
                <Route path="agents/new" element={<AgentForm />} />
                <Route path="agents/:id" element={<AgentDetails />} />
                <Route path="agents/:id/edit" element={<AgentForm />} />
                <Route
                  path="insurance"
                  element={<DocumentModulePage moduleKey="insurance" admin />}
                />
                <Route path="tax" element={<DocumentModulePage moduleKey="tax" admin />} />
                <Route path="puc" element={<DocumentModulePage moduleKey="puc" admin />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="subscription-plans" element={<AdminSubscriptionPlans />} />
                <Route path="agents/subscriptions" element={<AdminSubscriptionPayments />} />
                <Route path="subscription-invoices" element={<AdminSubscriptionInvoices />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="activity" element={<AdminActivity />} />
              </Route>

              {/* Agent routes */}
              <Route
                path="/agent"
                element={
                  <ProtectedRoute requiredRole="AGENT">
                    <AgentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AgentDashboard />} />
                <Route path="dashboard" element={<AgentDashboard />} />
                <Route
                  path="insurance"
                  element={
                    <ProtectedRoute requiredModuleAccess="insurance">
                      <InsuranceList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tax"
                  element={
                    <ProtectedRoute requiredModuleAccess="tax">
                      <TaxList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="puc"
                  element={
                    <ProtectedRoute requiredModuleAccess="puc">
                      <PucList />
                    </ProtectedRoute>
                  }
                />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="invoices" element={<AgentInvoices />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="reports" element={<AgentReports />} />
                <Route path="profile" element={<AgentProfile />} />
              </Route>

              {/* Error pages */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
