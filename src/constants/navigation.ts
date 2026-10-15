import { BadgeCheck, FileText, Gauge, LayoutDashboard, Receipt, ShieldCheck, Users } from "lucide-react";

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
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Insurance", to: "/insurance", icon: ShieldCheck },
      { label: "Tax", to: "/tax", icon: Receipt },
      { label: "PUC", to: "/puc", icon: FileText },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: Gauge },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Insurance", to: "/admin/insurance", icon: ShieldCheck },
      { label: "Tax", to: "/admin/tax", icon: Receipt },
      { label: "PUC", to: "/admin/puc", icon: FileText },
    ],
  },
];

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INSURANCE: "Insurance",
  TAX: "Tax",
  PUC: "PUC",
};

export const APP_NAME = "VehicleTrack Pro";
export const APP_TAGLINE = "Track Every Vehicle. Never Miss an Expiry.";
export { BadgeCheck };
