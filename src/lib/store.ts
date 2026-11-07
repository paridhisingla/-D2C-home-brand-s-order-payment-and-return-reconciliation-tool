// src/lib/store.ts
// Central Data & Business Logic Store for ReconTex

import {
  OrderRecord,
  RateCard,
  ColumnMappingConfig,
  AIReviewItem,
  ClaimRecord,
  TaxLedgerRecord,
  MoneyAtRiskDashboardData,
  AgingBucketSummary,
  LeakageCategory,
  ReconciliationStatus,
  User,
} from '../types';
import { INITIAL_ORDERS, INITIAL_CLAIMS, INITIAL_AI_REVIEW_ITEMS, INITIAL_TAX_LEDGER } from './sampleData';
import { DEFAULT_RATE_CARDS, evaluateReconciliation } from './rateEngine';
import { sanitizeOrderPII } from './dpdpMasker';

export const DEMO_USERS: User[] = [
  {
    id: 'usr_exec',
    name: 'Priya Nair',
    email: 'priya.nair@companya.in',
    role: 'FINANCE_EXECUTIVE',
    department: 'Accounts & Reconciliation',
  },
  {
    id: 'usr_founder',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@companya.in',
    role: 'CO_FOUNDER',
    department: 'Executive Finance',
  },
  {
    id: 'usr_returns',
    name: 'Ramesh Gowda',
    email: 'ramesh.gowda@companya.in',
    role: 'RETURNS_MANAGER',
    department: 'Bengaluru Fulfillment & Warehouse',
  },
];

class ReconciliationStore {
  private orders: OrderRecord[] = [];
  private rateCards: RateCard[] = [];
  private mappings: ColumnMappingConfig[] = [];
  private reviewQueue: AIReviewItem[] = [];
  private claims: ClaimRecord[] = [];
  private taxLedger: TaxLedgerRecord[] = [];
  private currentUser: User = DEMO_USERS[0];
  private isInitialized = false;

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    // Deep clone initial data
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.rateCards = JSON.parse(JSON.stringify(DEFAULT_RATE_CARDS));
    this.claims = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
    this.reviewQueue = JSON.parse(JSON.stringify(INITIAL_AI_REVIEW_ITEMS));
    this.taxLedger = JSON.parse(JSON.stringify(INITIAL_TAX_LEDGER));
    this.currentUser = DEMO_USERS[0];

    // Seed default mappings with 20-row preview and history
    this.mappings = [
      {
        id: 'map-amz-settlement',
        sourceType: 'SETTLEMENT',
        partnerName: 'Marketplace 1 (Amazon)',
        version: 2,
        mappings: {
          order_id: 'merchant_order_id',
          awb_number: 'tracking_id',
          settlement_amount: 'net_payout_amount',
          commission_fee: 'referral_fee_amount',
          closing_fee: 'fixed_closing_fee',
          tcs_amount: 'gst_tcs_cgst_sgst',
          tds_amount: 'income_tax_tds_194o',
          settlement_utr: 'bank_utr_reference',
          transaction_date: 'deposit_date',
        },
        samplePreview: [
          { _rowIndex: 1, order_id: 'ORD-M-88120', settlement_amount: 862, commission_fee: 179.85, tcs_amount: 11.99, tds_amount: 1.20 },
          { _rowIndex: 2, order_id: 'ORD-M-88301', settlement_amount: 693, commission_fee: 134.85, tcs_amount: 8.99, tds_amount: 0.90 },
        ],
        isApproved: true,
        approvedBy: 'Priya Nair (Finance Executive)',
        approvedAt: '2026-10-25T11:00:00Z',
        versionHistory: [
          {
            version: 1,
            mappings: { order_id: 'order_number', settlement_amount: 'payout' },
            approvedBy: 'Initial Setup',
            approvedAt: '2026-09-01T10:00:00Z',
            note: 'Initial import template before Amazon MTR header mutation in October',
          },
        ],
        createdAt: '2026-09-01T10:00:00Z',
      },
      {
        id: 'map-sr-cod',
        sourceType: 'COD_REMITTANCE',
        partnerName: 'Shiprocket',
        version: 1,
        mappings: {
          order_id: 'client_order_id',
          awb_number: 'airway_bill_no',
          cod_collected_amount: 'collected_amount',
          cod_handling_fee: 'cod_charges',
          net_remitted_amount: 'credit_amount',
          remittance_utr: 'utr_no',
          remittance_date: 'cr_date',
        },
        samplePreview: [
          { _rowIndex: 1, order_id: 'ORD-W-204118', cod_collected_amount: 1499, net_remitted_amount: 0, remittance_utr: 'PENDING' },
          { _rowIndex: 2, order_id: 'ORD-W-203991', cod_collected_amount: 1299, net_remitted_amount: 0, remittance_utr: 'OVERDUE' },
        ],
        isApproved: true,
        approvedBy: 'Priya Nair',
        approvedAt: '2026-10-01T09:00:00Z',
        versionHistory: [],
        createdAt: '2026-10-01T09:00:00Z',
      },
    ];

    this.isInitialized = true;
  }

  // --- Users & Roles ---
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public switchUserRole(role: User['role']): User {
    const user = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    this.currentUser = user;
    return this.currentUser;
  }

  // --- Orders & Reconciliation ---
  public getOrders(filters?: {
    channel?: string;
    status?: string;
    search?: string;
    differenceThreshold?: number; // e.g. 10
    maskPII?: boolean;
  }): OrderRecord[] {
    let result = [...this.orders];

    if (filters?.channel && filters.channel !== 'ALL') {
      result = result.filter(o => o.channel.toLowerCase() === filters.channel?.toLowerCase());
    }

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(o => o.reconciliationStatus.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.awbNumber.toLowerCase().includes(q) ||
        o.itemDescription.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    }

    if (filters?.differenceThreshold !== undefined) {
      result = result.filter(o => Math.abs(o.difference) >= filters.differenceThreshold!);
    }

    // Apply DPDP Act 2023 Masking if requested
    const shouldMask = filters?.maskPII !== false;
    return result.map(order => {
      const pii = sanitizeOrderPII(order, shouldMask);
      return {
        ...order,
        customerName: pii.name,
        customerPhone: pii.phone,
        customerAddress: pii.address,
      };
    });
  }

  public getOrderById(orderId: string, maskPII: boolean = true): OrderRecord | null {
    const order = this.orders.find(o => o.orderId.toUpperCase() === orderId.toUpperCase());
    if (!order) return null;
    const pii = sanitizeOrderPII(order, maskPII);
    return {
      ...order,
      customerName: pii.name,
      customerPhone: pii.phone,
      customerAddress: pii.address,
    };
  }

  public addOrders(newOrders: OrderRecord[]): void {
    newOrders.forEach(o => {
      const evalResult = evaluateReconciliation(o, this.rateCards);
      const evaluatedOrder: OrderRecord = {
        ...o,
        ...evalResult,
      };
      const existingIdx = this.orders.findIndex(ex => ex.orderId === o.orderId);
      if (existingIdx !== -1) {
        this.orders[existingIdx] = evaluatedOrder;
      } else {
        this.orders.unshift(evaluatedOrder);
      }
    });
  }

  // --- Rate Cards ---
  public getRateCards(): RateCard[] {
    return this.rateCards;
  }

  public updateRateCard(id: string, updates: Partial<RateCard>): RateCard {
    const idx = this.rateCards.findIndex(rc => rc.id === id);
    if (idx === -1) throw new Error(`Rate card ${id} not found`);
    this.rateCards[idx] = {
      ...this.rateCards[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate existing orders under new rate cards
    this.recalculateAllOrders();
    return this.rateCards[idx];
  }

  private recalculateAllOrders(): void {
    this.orders = this.orders.map(order => {
      const evaluated = evaluateReconciliation(order, this.rateCards);
      return {
        ...order,
        ...evaluated,
      };
    });
  }

  // --- Claims Management ---
  public getClaims(partner?: string, status?: string): ClaimRecord[] {
    let result = [...this.claims];
    if (partner && partner !== 'ALL') {
      result = result.filter(c => c.partner.toLowerCase().includes(partner.toLowerCase()));
    }
    if (status && status !== 'ALL') {
      result = result.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    return result;
  }

  public createClaimFromOrder(orderId: string, customNotes?: string): ClaimRecord {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const claimNum = `CLM-2026-${1050 + this.claims.length}`;
    let category: LeakageCategory = 'NONE';
    if (order.reconciliationStatus === 'Unpaid past due') category = 'UNREMITTED_COD';
    else if (order.reconciliationStatus === 'Short-paid') category = 'COMMISSION_OVERCHARGE';
    else if (order.reconciliationStatus === 'Freight overcharged') category = 'WEIGHT_SLAB_ERROR';
    else if (order.reconciliationStatus === 'Return not received') category = 'LOST_RETURN';

    const claim: ClaimRecord = {
      id: `clm-${Date.now()}`,
      claimNumber: claimNum,
      partner: order.channel === 'Website' ? order.courierPartner : order.channel,
      orderId: order.orderId,
      awbNumber: order.awbNumber,
      discrepancyType: category,
      disputedAmount: Math.abs(order.leakageAmount || order.difference),
      status: 'Submitted',
      evidenceDossier: {
        orderDate: order.orderDate,
        orderValue: order.orderValue,
        expectedPayout: order.expectedReceived,
        actualPayout: order.actualReceived,
        discrepancyMath: `Rate card expected ₹${order.expectedReceived} vs received ₹${order.actualReceived}. Difference: ₹${order.difference}`,
        weightCertifiedKg: order.physicalWeightKg,
        weightBilledKg: order.billedWeightKg,
        courierTrackingAwb: `${order.awbNumber} (${order.courierPartner})`,
        deliveryTimestamp: `${order.deliveryStatus} (${order.daysSinceDelivery} days ago)`,
        notes: customNotes || order.leakageReason,
      },
      recoveryDate: null,
      settlementUtr: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.claims.unshift(claim);
    order.claimId = claim.claimNumber;
    order.claimStatus = 'Submitted';
    return claim;
  }

  public updateClaimStatus(
    claimId: string,
    status: ClaimRecord['status'],
    settlementUtr?: string,
    recoveredAmount?: number
  ): ClaimRecord {
    const claim = this.claims.find(c => c.id === claimId || c.claimNumber === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    claim.status = status;
    claim.updatedAt = new Date().toISOString();
    if (settlementUtr) claim.settlementUtr = settlementUtr;
    if (status === 'Recovered') {
      claim.recoveryDate = new Date().toISOString();
      // Update corresponding order
      const order = this.orders.find(o => o.orderId === claim.orderId);
      if (order) {
        order.claimStatus = 'Recovered';
        order.leakageAmount = 0;
        order.reconciliationStatus = 'Settled';
      }
    }
    return claim;
  }

  // --- Returns Tracker & Warehouse Barcode Inwarding ---
  public logWarehouseScan(awbOrOrderId: string, condition: string = 'Good Condition'): {
    success: boolean;
    order?: OrderRecord;
    message: string;
  } {
    const clean = awbOrOrderId.trim().toUpperCase();
    const order = this.orders.find(o =>
      o.awbNumber.toUpperCase() === clean || o.orderId.toUpperCase() === clean
    );

    if (!order) {
      return {
        success: false,
        message: `AWB or Order ID "${awbOrOrderId}" not recognized in active shipments`,
      };
    }

    order.warehouseScanDate = new Date().toISOString();
    order.deliveryStatus = 'Returned to warehouse';

    // Re-evaluate reconciliation status now that physical receipt is confirmed
    const evaluated = evaluateReconciliation(order, this.rateCards);
    order.reconciliationStatus = evaluated.reconciliationStatus;
    order.leakageAmount = evaluated.leakageAmount;
    order.leakageReason = evaluated.leakageReason;

    return {
      success: true,
      order,
      message: `Successfully verified physical warehouse receipt for ${order.orderId} (AWB: ${order.awbNumber})`,
    };
  }

  // --- Column Mapping & AI Assistant ---
  public getColumnMappings(): ColumnMappingConfig[] {
    return this.mappings;
  }

  public saveColumnMapping(config: ColumnMappingConfig): void {
    const idx = this.mappings.findIndex(m => m.id === config.id);
    if (idx !== -1) {
      this.mappings[idx] = config;
    } else {
      this.mappings.push(config);
    }
  }

  // --- AI Review Queue ---
  public getReviewQueue(): AIReviewItem[] {
    return this.reviewQueue.map(item => {
      const order = this.orders.find(o => o.orderId === item.suggestedOrderId) || null;
      return {
        ...item,
        suggestedOrder: order,
      };
    });
  }

  public resolveReviewItem(
    itemId: string,
    action: 'ACCEPT' | 'REJECT' | 'MANUAL_LINK',
    manualOrderId?: string,
    note?: string
  ): AIReviewItem {
    const item = this.reviewQueue.find(i => i.id === itemId);
    if (!item) throw new Error(`Review item ${itemId} not found`);

    if (action === 'ACCEPT') {
      item.status = 'ACCEPTED';
      item.reviewedBy = this.currentUser.name;
      item.reviewedAt = new Date().toISOString();
      item.auditNote = note || `Approved AI match: linked transaction to ${item.suggestedOrderId}`;

      // Update the order's actual received amount
      const order = this.orders.find(o => o.orderId === item.suggestedOrderId);
      if (order) {
        order.actualReceived = item.rawAmount;
        const evaluated = evaluateReconciliation(order, this.rateCards);
        Object.assign(order, evaluated);
      }
    } else if (action === 'REJECT') {
      item.status = 'REJECTED';
      item.reviewedBy = this.currentUser.name;
      item.reviewedAt = new Date().toISOString();
      item.auditNote = note || 'Rejected AI recommendation. Order remains unmatched.';
    } else if (action === 'MANUAL_LINK' && manualOrderId) {
      item.status = 'MANUALLY_LINKED';
      item.suggestedOrderId = manualOrderId;
      item.reviewedBy = this.currentUser.name;
      item.reviewedAt = new Date().toISOString();
      item.auditNote = note || `Manually linked by finance executive to ${manualOrderId}`;

      const order = this.orders.find(o => o.orderId === manualOrderId);
      if (order) {
        order.actualReceived = item.rawAmount;
        const evaluated = evaluateReconciliation(order, this.rateCards);
        Object.assign(order, evaluated);
      }
    }

    return item;
  }

  // --- Tax Ledger (TCS / TDS) ---
  public getTaxLedger(): TaxLedgerRecord[] {
    return this.taxLedger;
  }

  // --- Executive Money-at-Risk Dashboard Aggregator ---
  public getDashboardData(): MoneyAtRiskDashboardData {
    const totalOrdersProcessed = 30000; // Annualized baseline 30,000 orders/month
    const totalGrossTurnover = 36000000; // ₹3.60 Crore monthly / ₹43.2 Cr annual

    // Categorized leakages
    let unremittedCod = 0;
    let commissionOvercharge = 0;
    let weightSlabError = 0;
    let lostReturn = 0;
    let totalRecovered = 0;

    this.orders.forEach(o => {
      if (o.reconciliationStatus === 'Unpaid past due') {
        unremittedCod += o.leakageAmount || 0;
      } else if (o.reconciliationStatus === 'Short-paid') {
        commissionOvercharge += o.leakageAmount || 0;
      } else if (o.reconciliationStatus === 'Freight overcharged') {
        weightSlabError += o.leakageAmount || 0;
      } else if (o.reconciliationStatus === 'Return not received') {
        lostReturn += o.leakageAmount || 0;
      }
    });

    this.claims.forEach(c => {
      if (c.status === 'Recovered') {
        totalRecovered += c.disputedAmount;
      }
    });

    const totalIdentified = unremittedCod + commissionOvercharge + weightSlabError + lostReturn;
    const totalPendingRisk = totalIdentified - totalRecovered;

    // Aging Buckets by Partner
    const aging: AgingBucketSummary[] = [
      {
        bucket: '0-15 Days',
        totalOrders: 3,
        totalAtRisk: 80, // e.g. Amazon short-pay, recent deliveries
        partners: [
          { partner: 'Marketplace 1 (Amazon)', amount: 37 },
          { partner: 'Quick-Commerce 2 (Zepto)', amount: 43 },
        ],
      },
      {
        bucket: '16-30 Days',
        totalOrders: 5,
        totalAtRisk: 4000,
        partners: [
          { partner: 'Shiprocket (COD)', amount: 1409 },
          { partner: 'Marketplace 3 (Myntra COD)', amount: 2568 },
          { partner: 'Shiprocket (Freight Slab)', amount: 46 },
        ],
      },
      {
        bucket: '31-60 Days',
        totalOrders: 2,
        totalAtRisk: 1285,
        partners: [
          { partner: 'Shiprocket (Old COD)', amount: 1209 },
          { partner: 'Delhivery (Volumetric Slab)', amount: 76 },
        ],
      },
      {
        bucket: '60+ Days',
        totalOrders: 1,
        totalAtRisk: 3499,
        partners: [
          { partner: 'Delhivery / Flipkart (Lost Return)', amount: 3499 },
        ],
      },
    ];

    // Total TCS & TDS statutory collections
    let totalTcs = 0;
    let totalTds = 0;
    this.taxLedger.forEach(t => {
      totalTcs += t.gstTcsDeducted;
      totalTds += t.incomeTaxTdsDeducted;
    });

    return {
      totalOrdersProcessed,
      totalGrossTurnover,
      autoMatchedRate: 98.4,
      totalLeakageIdentified: totalIdentified,
      totalRecovered,
      totalPendingRisk,
      monthEndClosePaceDays: 3.2, // Drastically reduced from 12 days to ~3 days!
      leakageByCategory: [
        {
          category: 'UNREMITTED_COD',
          title: 'Unremitted COD Remittances',
          amount: unremittedCod,
          percentage: totalIdentified > 0 ? Math.round((unremittedCod / totalIdentified) * 100) : 45,
          orderCount: this.orders.filter(o => o.reconciliationStatus === 'Unpaid past due').length,
        },
        {
          category: 'LOST_RETURN',
          title: 'Lost Returns (Un-scanned at Warehouse)',
          amount: lostReturn,
          percentage: totalIdentified > 0 ? Math.round((lostReturn / totalIdentified) * 100) : 32,
          orderCount: this.orders.filter(o => o.reconciliationStatus === 'Return not received').length,
        },
        {
          category: 'WEIGHT_SLAB_ERROR',
          title: 'Courier Freight Weight Overcharges',
          amount: weightSlabError,
          percentage: totalIdentified > 0 ? Math.round((weightSlabError / totalIdentified) * 100) : 12,
          orderCount: this.orders.filter(o => o.reconciliationStatus === 'Freight overcharged').length,
        },
        {
          category: 'COMMISSION_OVERCHARGE',
          title: 'Marketplace Commission & Fee Overcharges',
          amount: commissionOvercharge,
          percentage: totalIdentified > 0 ? Math.round((commissionOvercharge / totalIdentified) * 100) : 11,
          orderCount: this.orders.filter(o => o.reconciliationStatus === 'Short-paid').length,
        },
      ],
      partnerAging: aging,
      tcsTdsStatutoryTotal: {
        totalTcs,
        totalTds,
      },
    };
  }
}

// Global singleton instance
export const store = new ReconciliationStore();
