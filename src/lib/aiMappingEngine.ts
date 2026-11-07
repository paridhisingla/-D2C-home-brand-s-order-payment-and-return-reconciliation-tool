// src/lib/aiMappingEngine.ts
// AI-Assisted Column Mapping & Format Mutation Engine with 20-Row Preview & Rollback Versioning

import { SourceFileType, ColumnMappingConfig, ColumnMappingVersion } from '../types';

export interface CanonicalFieldDef {
  key: string;
  label: string;
  required: boolean;
  synonyms: string[];
  type: 'string' | 'number' | 'date';
}

export const CANONICAL_SCHEMAS: Record<SourceFileType, CanonicalFieldDef[]> = {
  ORDER_MASTER: [
    { key: 'order_id', label: 'Order ID', required: true, synonyms: ['order_id', 'order id', 'order no', 'orderno', 'sub_order_id', 'merchant_order_id', 'po_number', 'reference_id'], type: 'string' },
    { key: 'order_date', label: 'Order Date', required: true, synonyms: ['order_date', 'order date', 'created_at', 'purchase_date', 'order_time', 'booking_date'], type: 'date' },
    { key: 'channel', label: 'Sales Channel', required: true, synonyms: ['channel', 'source', 'platform', 'marketplace', 'store_name', 'sales_channel'], type: 'string' },
    { key: 'sku', label: 'Product SKU', required: false, synonyms: ['sku', 'product_sku', 'item_code', 'seller_sku', 'asin', 'fsn'], type: 'string' },
    { key: 'item_description', label: 'Item Description', required: false, synonyms: ['item_description', 'title', 'product_name', 'item_name', 'description'], type: 'string' },
    { key: 'order_value', label: 'Order Gross Value (₹)', required: true, synonyms: ['order_value', 'order value', 'gross_amount', 'total_amount', 'item_price', 'invoice_value', 'total_price'], type: 'number' },
    { key: 'payment_mode', label: 'Payment Mode (COD/Prepaid)', required: true, synonyms: ['payment_mode', 'payment mode', 'payment_method', 'payment_type', 'is_cod', 'pay_type'], type: 'string' },
    { key: 'awb_number', label: 'Courier AWB / Tracking', required: true, synonyms: ['awb_number', 'awb', 'waybill', 'tracking_no', 'tracking_number', 'airway_bill', 'consignment_no'], type: 'string' },
    { key: 'courier_partner', label: 'Courier Partner', required: false, synonyms: ['courier_partner', 'courier', 'transporter', 'carrier', 'aggregator', 'logistics_partner'], type: 'string' },
    { key: 'physical_weight_kg', label: 'Certified Catalog Weight (kg)', required: false, synonyms: ['physical_weight_kg', 'actual_weight', 'dead_weight', 'product_weight', 'weight_kg'], type: 'number' },
    { key: 'customer_name', label: 'Customer Name (DPDP)', required: false, synonyms: ['customer_name', 'buyer_name', 'recipient_name', 'consignee_name', 'name'], type: 'string' },
    { key: 'customer_phone', label: 'Customer Phone (DPDP)', required: false, synonyms: ['customer_phone', 'mobile', 'phone', 'contact_number', 'consignee_phone'], type: 'string' },
    { key: 'customer_address', label: 'Customer Address (DPDP)', required: false, synonyms: ['customer_address', 'shipping_address', 'address_line1', 'destination_address'], type: 'string' },
    { key: 'city', label: 'City', required: false, synonyms: ['city', 'destination_city', 'town', 'district'], type: 'string' },
  ],
  SETTLEMENT: [
    { key: 'order_id', label: 'Order ID', required: true, synonyms: ['order_id', 'order id', 'order_no', 'merchant_order_id', 'sub_order_number', 'marketplace_order_id'], type: 'string' },
    { key: 'awb_number', label: 'AWB Number', required: false, synonyms: ['awb_number', 'awb', 'tracking_id', 'waybill'], type: 'string' },
    { key: 'settlement_amount', label: 'Net Settled Payout (₹)', required: true, synonyms: ['settlement_amount', 'net_amount', 'bank_settlement', 'payout', 'settled_amt', 'net_receivable', 'transferred_amount'], type: 'number' },
    { key: 'commission_fee', label: 'Marketplace Commission (₹)', required: false, synonyms: ['commission_fee', 'commission', 'referral_fee', 'marketplace_fee', 'selling_fee'], type: 'number' },
    { key: 'closing_fee', label: 'Fixed Closing Fee (₹)', required: false, synonyms: ['closing_fee', 'fixed_fee', 'order_processing_fee', 'listing_fee'], type: 'number' },
    { key: 'tcs_amount', label: 'GST TCS (1%) (₹)', required: false, synonyms: ['tcs_amount', 'gst_tcs', 'tcs_cgst_sgst', 'igst_tcs', 'tax_collected_at_source'], type: 'number' },
    { key: 'tds_amount', label: 'Income Tax TDS (Sec 194-O) (₹)', required: false, synonyms: ['tds_amount', 'tds_194o', 'section_194o_tds', 'income_tax_tds', 'tds'], type: 'number' },
    { key: 'settlement_utr', label: 'Bank UTR / Ref No', required: false, synonyms: ['settlement_utr', 'utr', 'bank_reference', 'payment_id', 'neft_utr', 'deposit_ref'], type: 'string' },
    { key: 'transaction_date', label: 'Settlement Date', required: false, synonyms: ['transaction_date', 'settlement_date', 'deposit_date', 'payout_date', 'value_date'], type: 'date' },
  ],
  COD_REMITTANCE: [
    { key: 'order_id', label: 'Order ID', required: true, synonyms: ['order_id', 'order id', 'merchant_ref', 'client_order_no', 'client_order_id'], type: 'string' },
    { key: 'awb_number', label: 'AWB Number', required: true, synonyms: ['awb_number', 'awb', 'waybill', 'cr_awb', 'consignment_id'], type: 'string' },
    { key: 'cod_collected_amount', label: 'COD Cash Collected (₹)', required: true, synonyms: ['cod_collected_amount', 'cod_collected', 'collected_amount', 'cod_amount', 'cash_collected'], type: 'number' },
    { key: 'cod_handling_fee', label: 'COD Processing Fee (₹)', required: false, synonyms: ['cod_handling_fee', 'cod_fee', 'cod_charges', 'handling_fee'], type: 'number' },
    { key: 'net_remitted_amount', label: 'Net Bank Remitted Amount (₹)', required: true, synonyms: ['net_remitted_amount', 'net_remitted', 'remitted_amt', 'bank_credit_amount', 'net_payable'], type: 'number' },
    { key: 'remittance_utr', label: 'Remittance UTR', required: false, synonyms: ['remittance_utr', 'utr', 'bank_utr', 'cheque_no', 'transfer_ref'], type: 'string' },
    { key: 'remittance_date', label: 'Remittance Date', required: false, synonyms: ['remittance_date', 'remitted_date', 'cr_date', 'transfer_date'], type: 'date' },
  ],
  FREIGHT_INVOICE: [
    { key: 'awb_number', label: 'AWB Number', required: true, synonyms: ['awb_number', 'awb', 'waybill', 'tracking_no', 'lr_number', 'consignment_no'], type: 'string' },
    { key: 'order_id', label: 'Order ID', required: false, synonyms: ['order_id', 'order id', 'client_order_id', 'reference_no', 'order_ref'], type: 'string' },
    { key: 'billed_weight_kg', label: 'Courier Billed Weight (kg)', required: true, synonyms: ['billed_weight_kg', 'billed_weight', 'chargeable_weight', 'charged_weight', 'volumetric_weight', 'applied_weight_kg'], type: 'number' },
    { key: 'zone', label: 'Zone (Local/Metro/National)', required: false, synonyms: ['zone', 'destination_zone', 'applied_zone', 'delivery_zone'], type: 'string' },
    { key: 'freight_charged', label: 'Forward Freight Charged (₹)', required: true, synonyms: ['freight_charged', 'total_freight', 'shipping_charge', 'forward_charge', 'freight_amount', 'invoice_amt'], type: 'number' },
    { key: 'rto_freight_charged', label: 'RTO / Return Freight (₹)', required: false, synonyms: ['rto_freight_charged', 'rto_charges', 'reverse_freight', 'return_charge'], type: 'number' },
    { key: 'cod_charge', label: 'COD Fee Charged (₹)', required: false, synonyms: ['cod_charge', 'cod_fee', 'cod_service_charge'], type: 'number' },
  ],
  WAREHOUSE_SCAN: [
    { key: 'awb_number', label: 'Scanned AWB / Barcode', required: true, synonyms: ['awb_number', 'scanned_barcode', 'awb', 'waybill', 'tracking_id', 'barcode'], type: 'string' },
    { key: 'order_id', label: 'Order ID', required: false, synonyms: ['order_id', 'order id', 'order_ref', 'client_ref'], type: 'string' },
    { key: 'scan_timestamp', label: 'Warehouse Inward Scan Time', required: true, synonyms: ['scan_timestamp', 'scan_date', 'received_at', 'inward_date', 'scanned_time'], type: 'date' },
    { key: 'received_condition', label: 'Physical Package Condition', required: false, synonyms: ['received_condition', 'condition', 'package_status', 'damage_status', 'qc_status'], type: 'string' },
    { key: 'scanned_by_staff', label: 'Warehouse Staff ID', required: false, synonyms: ['scanned_by_staff', 'operator', 'scanner_id', 'staff_name'], type: 'string' },
  ],
};

/**
 * Computes simple fuzzy/normalized string distance to suggest column mapping
 */
function calculateSimilarity(strA: string, strB: string): number {
  const normA = strA.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normB = strB.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  // Token overlap
  const wordsA = strA.toLowerCase().split(/[\s_\-]+/);
  const wordsB = strB.toLowerCase().split(/[\s_\-]+/);
  const common = wordsA.filter(w => wordsB.includes(w) && w.length > 2);
  if (common.length > 0) {
    return 0.7 + (common.length * 0.1);
  }

  return 0.0;
}

/**
 * AI Mapping Proposal: Analyzes uploaded CSV headers and generates suggested mappings with confidence scores.
 */
export function proposeColumnMapping(
  sourceType: SourceFileType,
  uploadedHeaders: string[],
  sampleRows: Array<Record<string, any>> = []
): {
  proposedMapping: Record<string, string>; // { targetCanonicalKey: uploadedHeader }
  confidenceScores: Record<string, number>; // 0 to 100%
  unmappedHeaders: string[];
  samplePreview: Array<Record<string, any>>; // 20-row preview
} {
  const schema = CANONICAL_SCHEMAS[sourceType] || CANONICAL_SCHEMAS.ORDER_MASTER;
  const proposedMapping: Record<string, string> = {};
  const confidenceScores: Record<string, number> = {};
  const usedHeaders = new Set<string>();

  schema.forEach(fieldDef => {
    let bestHeader = '';
    let highestScore = 0;

    uploadedHeaders.forEach(header => {
      if (usedHeaders.has(header)) return;

      // Check exact synonym match
      for (const syn of fieldDef.synonyms) {
        const score = calculateSimilarity(header, syn);
        if (score > highestScore) {
          highestScore = score;
          bestHeader = header;
        }
      }
    });

    if (highestScore >= 0.65 && bestHeader) {
      proposedMapping[fieldDef.key] = bestHeader;
      confidenceScores[fieldDef.key] = Math.round(highestScore * 100);
      usedHeaders.add(bestHeader);
    }
  });

  const unmappedHeaders = uploadedHeaders.filter(h => !usedHeaders.has(h));

  // Generate 20-row preview
  const previewRows = sampleRows.slice(0, 20).map((row, idx) => {
    const canonicalRow: Record<string, any> = { _rowIndex: idx + 1 };
    schema.forEach(fieldDef => {
      const srcHeader = proposedMapping[fieldDef.key];
      canonicalRow[fieldDef.key] = srcHeader && row[srcHeader] !== undefined ? row[srcHeader] : null;
    });
    return canonicalRow;
  });

  return {
    proposedMapping,
    confidenceScores,
    unmappedHeaders,
    samplePreview: previewRows,
  };
}

/**
 * Manages versioning and rollback of column mappings.
 */
export function approveAndSaveMapping(
  currentConfig: ColumnMappingConfig,
  newMappings: Record<string, string>,
  approvedBy: string,
  approvalNote?: string
): ColumnMappingConfig {
  const currentVersion = currentConfig.version || 1;

  // Archive prior version into history
  const historyEntry: ColumnMappingVersion = {
    version: currentVersion,
    mappings: { ...currentConfig.mappings },
    approvedBy: currentConfig.approvedBy || 'Initial Setup',
    approvedAt: currentConfig.approvedAt || currentConfig.createdAt,
    note: approvalNote || `Archived prior to upgrading to v${currentVersion + 1}`,
  };

  const updatedHistory = [...(currentConfig.versionHistory || []), historyEntry];

  return {
    ...currentConfig,
    version: currentVersion + 1,
    mappings: newMappings,
    isApproved: true,
    approvedBy,
    approvedAt: new Date().toISOString(),
    versionHistory: updatedHistory,
  };
}

/**
 * Rolls back a column mapping configuration to a specific prior version.
 */
export function rollbackMappingVersion(
  currentConfig: ColumnMappingConfig,
  targetVersion: number,
  rolledBackBy: string
): ColumnMappingConfig {
  const targetHistoryItem = currentConfig.versionHistory.find(v => v.version === targetVersion);
  if (!targetHistoryItem) {
    throw new Error(`Mapping version v${targetVersion} not found in history`);
  }

  // Archive current before rolling back
  const archiveCurrent: ColumnMappingVersion = {
    version: currentConfig.version,
    mappings: { ...currentConfig.mappings },
    approvedBy: currentConfig.approvedBy || rolledBackBy,
    approvedAt: currentConfig.approvedAt || new Date().toISOString(),
    note: `Archived automatically prior to rollback to v${targetVersion}`,
  };

  return {
    ...currentConfig,
    version: targetVersion,
    mappings: { ...targetHistoryItem.mappings },
    isApproved: true,
    approvedBy: rolledBackBy,
    approvedAt: new Date().toISOString(),
    versionHistory: [...currentConfig.versionHistory, archiveCurrent],
  };
}
