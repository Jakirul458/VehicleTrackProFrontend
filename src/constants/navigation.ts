import { BadgeCheck, Gauge, LayoutDashboard, Receipt, ShieldCheck, Users } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof Users;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const AGENT_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Customers", to: "/customers", icon: Users },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Insurance", to: "/insurance", icon: ShieldCheck },
      { label: "Tax", to: "/tax", icon: Receipt },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: Gauge },
      { label: "Customers", to: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Insurance", to: "/admin/insurance", icon: ShieldCheck },
      { label: "Tax", to: "/admin/tax", icon: Receipt },
    ],
  },
];

export const PLANS = [
  {
    id: "TRIAL" as const,
    name: "Free Trial",
    price: "₹0",
    period: "for 7 days",
    description: "Try the full workflow with no commitment.",
    features: ["7 days access", "Up to 50 customers", "Basic document tracking", "Dashboard access"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    id: "BASIC" as const,
    name: "Basic",
    price: "₹499",
    period: "per month",
    description: "For single-counter agents and cyber cafés.",
    features: [
      "Up to 500 customers",
      "Insurance tracking",
      "Tax tracking",
      "Expiry tracking",
      "Expiry dashboard",
    ],
    cta: "Choose Basic",
    highlighted: true,
  },
  {
    id: "PRO" as const,
    name: "Pro",
    price: "₹1,299",
    period: "per month",
    description: "For growing multi-service documentation businesses.",
    features: [
      "Unlimited customer capacity",
      "Insurance and tax tracking",
      "Expiry dashboard",
      "Customer records",
    ],
    cta: "Choose Pro",
    highlighted: false,
  },
];

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INSURANCE: "Insurance",
  TAX: "Tax",
};

export const APP_NAME = "VehicleTrack Pro";
export const APP_TAGLINE = "Track Every Vehicle. Never Miss an Expiry.";
export { BadgeCheck };
