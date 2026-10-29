import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import AgentLayout from "./layouts/AgentLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Public pages
import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import RenewalPaymentPage from "./pages/public/RenewalPaymentPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentsList from "./pages/admin/AgentsList";
import AgentForm from "./pages/admin/AgentForm";
import AgentDetails from "./pages/admin/AgentDetails";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminActivity from "./pages/admin/AdminActivity";

// Agent pages
import AgentDashboard from "./pages/agent/AgentDashboard";
import InsuranceList from "./pages/agent/InsuranceList";
import TaxList from "./pages/agent/TaxList";
import PucList from "./pages/agent/PucList";
import RemindersPage from "./pages/agent/RemindersPage";
import AgentReports from "./pages/agent/AgentReports";
import AgentProfile from "./pages/agent/AgentProfile";
import { DocumentModulePage } from "./components/documents/DocumentModulePage";
import PaymentsPage from "./pages/agent/PaymentsPage";

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
    title: "VehicleTrack Pro | Insurance, Tax & PUC Management",
    description:
      "Track insurance, road tax and PUC expiry dates, and send renewal reminders with VehicleTrack Pro.",
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
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
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
              <Route path="insurance" element={<InsuranceList />} />
              <Route path="tax" element={<TaxList />} />
              <Route path="puc" element={<PucList />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="reports" element={<AgentReports />} />
              <Route path="profile" element={<AgentProfile />} />
            </Route>

            {/* Error pages */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
