/**
 * Shared domain types. These mirror the expected Node.js + Express + Mongoose
 * backend documents (Mongo `_id` is mapped to `id` by the API layer).
 */

export type Role = "SUPER_ADMIN" | "AGENT";

export type ExpiryStatus = "ACTIVE" | "DUE_SOON" | "URGENT" | "EXPIRED" | "INCOMPLETE";

export type AgentStatus = "ACTIVE" | "SUSPENDED";

export type VehicleType = "CAR" | "MOTORCYCLE" | "COMMERCIAL" | "THREE_WHEELER" | "OTHER";

export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "CNG" | "HYBRID" | "OTHER";

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
  plan?: "TRIAL" | "BASIC" | "PRO";
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
  customerPaid?: number;
  paymentStatus?: "PAID" | "PENDING";
}

export type Puc = DocumentRecord;

export interface Customer {
  id: string;
  agentId: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDocument {
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceStartDate?: string;
  insuranceExpiryDate?: string;
  insuranceMobileNo?: string;
  insurancePremium?: number;
  insurancePayToPortal?: number;
  insuranceCustomerPaid?: number;
  insuranceCommission?: number;
  roadTaxStartDate?: string;
  roadTaxExpiryDate?: string;
  roadTaxAmount?: number;
  roadTaxCustomerPaid?: number;
  roadTaxProfit?: number;
  pucNumber?: string;
  pucStartDate?: string;
  pucExpiryDate?: string;
  fitnessStartDate?: string;
  fitnessExpiryDate?: string;
  permitNumber?: string;
  permitStartDate?: string;
  permitExpiryDate?: string;
}

export interface Vehicle {
  id: string;
  agentId: string;
  customerId: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleVariant?: string;
  manufacturingYear: number;
  fuelType: FuelType;
  chassisNumber: string;
  engineNumber: string;
  ownerName: string;
  documents: VehicleDocument;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  suspendedAgents: number;
  totalCustomers: number;
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
  totalCustomers: number;
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
  recentCustomers: Customer[];
  recentVehicles: Vehicle[];
}
