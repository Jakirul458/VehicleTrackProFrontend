/**
 * Shared domain types. These mirror the expected Node.js + Express + Mongoose
 * backend documents (Mongo `_id` is mapped to `id` by the API layer).
 */

export type Role = "SUPER_ADMIN" | "AGENT";

export type ExpiryStatus = "ACTIVE" | "DUE_SOON" | "URGENT" | "EXPIRED" | "INCOMPLETE";

export type AgentStatus = "ACTIVE" | "SUSPENDED";

export interface ApiResponse<T> {
  success: boolean;
  message?: string | undefined;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  status: AgentStatus;
  trialEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent extends User {
  agentCode?: string;
}

export interface DocumentRecord {
  id: string;
  agentId: string;
  customerId?: string;
  customerName?: string;
  mobile?: string;
  vehicleNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  startDate?: string;
  expiryDate?: string;
  reminderDoneAt?: string;
  address?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  paymentDate?: string;
}

export interface Insurance extends DocumentRecord {
  policyNumber?: string;
  insuranceCompany?: string;
  policyType?: "Comprehensive" | "Third Party" | "Own Damage";
  premium?: number;
  portalPaid?: number;
  customerPaid?: number;
  commission?: number;
}

export interface Tax extends DocumentRecord {
  taxType?: "Road Tax" | "Green Tax" | "Professional Tax";
  taxPeriod?: "Quarterly" | "Half-yearly" | "Yearly" | "Lifetime";
  amount?: number;
  portalPaid?: number;
  customerPaid?: number;
  paymentStatus?: "PAID" | "PENDING";
}

export interface Puc extends DocumentRecord {
  amount?: number;
  portalPaid?: number;
  customerPaid?: number;
}

export interface PaymentRecord {
  id: string;
  agentId: string;
  agentName?: string;
  type: "Insurance" | "Tax" | "PUC";
  customerName?: string;
  mobile?: string;
  vehicleNumber?: string;
  paymentDate: string;
  documentAmount: number;
  customerPaid: number;
  portalPaid: number;
  commission: number;
}

export interface PaymentAgent {
  id: string;
  name: string;
}

export interface PaymentRecordsResponse {
  records: PaymentRecord[];
  agents: PaymentAgent[];
}

export type ReminderType = "insurance" | "tax" | "puc";

export interface ExpiryReminder {
  id: string;
  type: ReminderType;
  customerName?: string;
  mobile?: string;
  vehicleNumber?: string;
  expiryDate: string;
  daysLeft: number;
}

export interface RemindersResponse {
  warningDays: number;
  items: ExpiryReminder[];
}

export interface ActivityLog {
  id: string;
  actorId: string | { fullName?: string; email?: string } | null;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface PlatformSettings {
  supportWhatsapp: string;
  supportEmail: string;
  qrCodeUrl: string;
  upiId: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
}

export interface FinancialPeriodSummary {
  paidToPortal: number;
  commissionEarned: number;
  collectedFromCustomers: number;
  records: number;
}

export interface AgentFinancialSummary {
  monthly: FinancialPeriodSummary;
  yearly: FinancialPeriodSummary;
  lifetime: FinancialPeriodSummary;
}

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  suspendedAgents: number;
  totalVehicles: number;
  activeInsurance: number;
  insuranceDue: number;
  insuranceSoon: number;
  insuranceUrgent: number;
  expiringInsurance: number;
  expiredInsurance: number;
  activeTax: number;
  taxDue: number;
  taxSoon: number;
  taxUrgent: number;
  expiringTax: number;
  expiredTax: number;
  activePuc: number;
  pucDue: number;
  pucSoon: number;
  pucUrgent: number;
  expiredPuc: number;
}

export interface AgentDashboardStats {
  totalVehicles: number;
  activeInsurance: number;
  insuranceExpiringSoon: number;
  insuranceDue: number;
  insuranceSoon: number;
  insuranceUrgent: number;
  expiredInsurance: number;
  activeTax: number;
  taxDue: number;
  taxSoon: number;
  taxUrgent: number;
  taxExpiringSoon: number;
  expiredTax: number;
  activePuc: number;
  pucDue: number;
  pucSoon: number;
  pucUrgent: number;
  pucExpiringSoon: number;
  expiredPuc: number;
}
