import type { ReactNode } from "react";
import { createResourceApi } from "@/api/client";
import { formatCurrency, formatDate } from "@/lib/expiry";

export type Row = { id: string; agentId: string } & Record<string, unknown>;

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  options?: string[];
}

export interface ModuleDef {
  key: "insurance" | "tax" | "puc";
  title: string;
  singular: string;
  description: string;
  api: ReturnType<typeof createResourceApi<Row>>;
  columns: { key: string; header: string; render?: (row: Row) => ReactNode }[];
  fields: FieldDef[];
}

const customerFields: FieldDef[] = [
  { name: "customerName", label: "Name", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "vehicleNumber", label: "RC no.", type: "text" },
];
const vehicleFields: FieldDef[] = [
  ...customerFields,
  { name: "chassisNumber", label: "Chassis no.", type: "text" },
  { name: "engineNumber", label: "Engine no.", type: "text" },
];
const dateColumns = [
  {
    key: "startDate",
    header: "Start",
    render: (row: Row) => formatDate(row["startDate"] as string),
  },
  {
    key: "expiryDate",
    header: "End",
    render: (row: Row) => formatDate(row["expiryDate"] as string),
  },
  { key: "daysLeft", header: "Days left" },
];
const statusColumn = { key: "status", header: "Status" };
const addressColumns = [
  { key: "address", header: "Address" },
  { key: "remarks", header: "Remarks" },
];

export const MODULES: Record<ModuleDef["key"], ModuleDef> = {
  insurance: {
    key: "insurance",
    title: "Insurance",
    singular: "Policy",
    description: "Track policies, renewal dates, and payments.",
    api: createResourceApi<Row>("insurance"),
    columns: [
      { key: "customerName", header: "Name" },
      { key: "mobile", header: "Mobile" },
      { key: "vehicleNumber", header: "RC no." },
      { key: "policyNumber", header: "Policy no." },
      { key: "insuranceCompany", header: "Company" },
      { key: "policyType", header: "Type" },
      {
        key: "premium",
        header: "Premium",
        render: (row) => formatCurrency(row["premium"] as number),
      },
      ...dateColumns,
      statusColumn,
      ...addressColumns,
      {
        key: "portalPaid",
        header: "Portal paid",
        render: (row) => formatCurrency(row["portalPaid"] as number),
      },
      {
        key: "customerPaid",
        header: "Customer paid",
        render: (row) => formatCurrency(row["customerPaid"] as number),
      },
      {
        key: "commission",
        header: "Commission",
        render: (row) => formatCurrency(row["commission"] as number),
      },
    ],
    fields: [
      ...customerFields,
      { name: "policyNumber", label: "Policy no.", type: "text" },
      { name: "insuranceCompany", label: "Company", type: "text" },
      {
        name: "policyType",
        label: "Type",
        type: "select",
        options: ["Comprehensive", "Third Party", "Own Damage"],
      },
      { name: "premium", label: "Premium (₹)", type: "number" },
      { name: "startDate", label: "Policy start", type: "date" },
      { name: "expiryDate", label: "Policy expiry", type: "date" },
      { name: "address", label: "Address", type: "text" },
      { name: "remarks", label: "Remarks", type: "text" },
      { name: "portalPaid", label: "Portal paid (₹)", type: "number" },
      { name: "customerPaid", label: "Customer paid (₹)", type: "number" },
      { name: "commission", label: "Commission (₹)", type: "number" },
    ],
  },
  tax: {
    key: "tax",
    title: "Tax",
    singular: "Tax record",
    description: "Track vehicle tax dates and payment details.",
    api: createResourceApi<Row>("tax"),
    columns: [
      { key: "customerName", header: "Name" },
      { key: "mobile", header: "Mobile" },
      { key: "vehicleNumber", header: "RC no." },
      { key: "chassisNumber", header: "Chassis no." },
      { key: "engineNumber", header: "Engine no." },
      ...dateColumns,
      statusColumn,
      ...addressColumns,
      {
        key: "amount",
        header: "Tax amount",
        render: (row) => formatCurrency(row["amount"] as number),
      },
      {
        key: "customerPaid",
        header: "Customer paid",
        render: (row) => formatCurrency(row["customerPaid"] as number),
      },
    ],
    fields: [
      ...vehicleFields,
      { name: "startDate", label: "Start", type: "date" },
      { name: "expiryDate", label: "End", type: "date" },
      { name: "address", label: "Address", type: "text" },
      { name: "remarks", label: "Remarks", type: "text" },
      { name: "amount", label: "Tax amount (₹)", type: "number" },
      { name: "customerPaid", label: "Customer paid (₹)", type: "number" },
    ],
  },
  puc: {
    key: "puc",
    title: "PUC",
    singular: "PUC record",
    description: "Track pollution certificate details and expiry dates.",
    api: createResourceApi<Row>("puc"),
    columns: [
      { key: "customerName", header: "Name" },
      { key: "mobile", header: "Mobile" },
      { key: "vehicleNumber", header: "RC no." },
      { key: "chassisNumber", header: "Chassis no." },
      { key: "engineNumber", header: "Engine no." },
      ...dateColumns,
      statusColumn,
      ...addressColumns,
    ],
    fields: [
      ...vehicleFields,
      { name: "startDate", label: "Start", type: "date" },
      { name: "expiryDate", label: "End", type: "date" },
      { name: "address", label: "Address", type: "text" },
      { name: "remarks", label: "Remarks", type: "text" },
    ],
  },
};
