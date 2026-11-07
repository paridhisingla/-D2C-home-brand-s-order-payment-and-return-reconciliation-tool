// src/types/index.ts
// Core domain types for ReconTex - D2C Home Textiles Reconciliation System

export type UserRole = 'FINANCE_EXECUTIVE' | 'CO_FOUNDER' | 'RETURNS_MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export type SalesChannel = 
  | 'Website'
  | 'Marketplace 1'
  | 'Marketplace 2'
  | 'Marketplace 3'
  | 'Quick-Commerce 1'
  | 'Quick-Commerce 2';

export type CourierPartner = 'Shiprocket' | 'Delhivery';

export type PaymentMode = 'COD' | 'Prepaid';

export type DeliveryStatus = 
  | 'Delivered'
  | 'Returned to warehouse'
  | 'In transit'
  | 'RTO initiated'
  | 'Lost in transit'
  | 'Cancelled';

export type ReconciliationStatus = 
  | 'Settled'
  | 'Short-paid'
  | 'Unpaid past due'
  | 'Freight overcharged'
  | 'Return not received';

export type LeakageCategory = 
  | 'UNREMITTED_COD'
  | 'COMMISSION_OVERCHARGE'
  | 'WEIGHT_SLAB_ERROR'
  | 'LOST_RETURN'
  | 'PAYMENT_GATEWAY_FEE'
  | 'NONE';

export interface FeesBreakdown {
  commission: number;
  closingFee: number;
  paymentGatewayFee: number;
  courierFreight: number;
  codHandlingFee: number;
  tcs: number; // 1% GST TCS
  tds: number; // 0.1% or 1% Income Tax TDS
  expectedNetPayout: number;
}

export interface OrderRecord {
  id: string;
  orderId: string; // e.g. "ORD-W-204118"
  channel: SalesChannel;
  orderDate: string; // ISO
  itemDescription: string;
  sku: string;
  orderValue: number; // Gross value
  paymentMode: PaymentMode;
  deliveryStatus: DeliveryStatus;
  courierPartner: CourierPartner;
  awbNumber: string;
  physicalWeightKg: number;
  billedWeightKg: number;
  expectedReceived: number;
  actualReceived: number;
  difference: number; // actualReceived - expectedReceived
  reconciliationStatus: ReconciliationStatus;
  leakageAmount: number;
  leakageReason: string;
  tcsDeducted: number;
  tdsDeducted: number;
  commissionDeducted: number;
  freightDeducted: number;
  codFeeDeducted: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  zone: 'Local' | 'Regional' | 'Metro' | 'National';
  warehouseScanDate?: string | null;
  daysSinceDelivery: number;
  claimId?: string | null;
  claimStatus: 'None' | 'Draft' | 'Submitted' | 'Under Review' | 'Recovered' | 'Rejected';
  feesBreakdown?: FeesBreakdown;
}

export interface RateCard {
  id: string;
  type: 'CHANNEL' | 'COURIER';
  name: string;
  commissionPercent: number;
  fixedClosingFee: number;
  paymentGatewayPercent: number;
  baseWeightGrams: number;
  baseRateLocal: number;
  baseRateRegional: number;
  baseRateMetro: number;
  baseRateNational: number;
  extraSlabRate: number; // per 500g extra
  codFixedFee: number;
  codPercentFee: number;
  rtoChargePercent: number;
  tcsPercent: number;
  tdsPercent: number;
  isActive: boolean;
  updatedAt: string;
}

export type SourceFileType = 
  | 'ORDER_MASTER'
  | 'SETTLEMENT'
  | 'COD_REMITTANCE'
  | 'FREIGHT_INVOICE'
  | 'WAREHOUSE_SCAN';

export interface ColumnMappingVersion {
  version: number;
  mappings: Record<string, string>;
  approvedBy: string;
  approvedAt: string;
  note?: string;
}

export interface ColumnMappingConfig {
  id: string;
  sourceType: SourceFileType;
  partnerName: string;
  version: number;
  mappings: Record<string, string>; // { targetField: sourceHeader }
  samplePreview: Array<Record<string, any>>; // 20-row preview
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  versionHistory: ColumnMappingVersion[];
  createdAt: string;
}

export interface AIReviewItem {
  id: string;
  partner: string;
  rawPaymentRef: string;
  rawAwb: string;
  rawAmount: number;
  transactionDate: string;
  suggestedOrderId: string;
  suggestedOrder?: OrderRecord | null;
  confidenceScore: number; // 0 to 100
  matchReasons: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'MANUALLY_LINKED';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  auditNote?: string | null;
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  claimNumber: string; // "CLM-2026-1042"
  partner: string;
  orderId: string;
  awbNumber: string;
  discrepancyType: LeakageCategory;
  disputedAmount: number;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Recovered' | 'Rejected';
  evidenceDossier: {
    orderDate: string;
    orderValue: number;
    expectedPayout: number;
    actualPayout: number;
    discrepancyMath: string;
    weightCertifiedKg: number;
    weightBilledKg: number;
    courierTrackingAwb: string;
    deliveryTimestamp: string;
    notes: string;
  };
  recoveryDate?: string | null;
  settlementUtr?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaxLedgerRecord {
  partner: string;
  channelType: string;
  month: string;
  grossSales: number;
  taxableValue: number;
  gstTcsDeducted: number; // 1%
  incomeTaxTdsDeducted: number; // 0.1% or 1%
  portalStatus: 'Reconciled' | 'Pending GSTR-8' | 'Variance Flagged';
  differenceWithGovt: number;
}

export interface AgingBucketSummary {
  bucket: '0-15 Days' | '16-30 Days' | '31-60 Days' | '60+ Days';
  totalOrders: number;
  totalAtRisk: number;
  partners: {
    partner: string;
    amount: number;
  }[];
}

export interface MoneyAtRiskDashboardData {
  totalOrdersProcessed: number;
  totalGrossTurnover: number;
  autoMatchedRate: number; // e.g. 98.4%
  totalLeakageIdentified: number;
  totalRecovered: number;
  totalPendingRisk: number;
  monthEndClosePaceDays: number; // e.g. 3.2 days (target: 3 days, down from 12)
  leakageByCategory: {
    category: LeakageCategory;
    title: string;
    amount: number;
    percentage: number;
    orderCount: number;
  }[];
  partnerAging: AgingBucketSummary[];
  tcsTdsStatutoryTotal: {
    totalTcs: number;
    totalTds: number;
  };
}

export interface BenchmarkResult {
  totalRowsProcessed: number;
  elapsedMilliseconds: number;
  elapsedSeconds: number;
  rowsPerSecond: number;
  matchedCount: number;
  shortPaidCount: number;
  unpaidCodCount: number;
  freightOverchargeCount: number;
  lostReturnCount: number;
  memoryUsageMb: number;
  meetsSla: boolean; // under 60 seconds
}
