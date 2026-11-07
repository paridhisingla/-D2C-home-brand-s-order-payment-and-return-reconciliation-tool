// src/lib/aiMappingEngine.mjs
// AI-Assisted Column Mapping & Format Mutation Engine

export const CANONICAL_SCHEMAS = {
  ORDER_MASTER: [
    { key: 'order_id', label: 'Order ID', required: true, synonyms: ['order_id', 'order id', 'order no', 'orderno', 'sub_order_id', 'merchant_order_id', 'po_number', 'reference_id'], type: 'string' },
    { key: 'order_date', label: 'Order Date', required: true, synonyms: ['order_date', 'order date', 'created_at', 'purchase_date', 'order_time', 'booking_date'], type: 'date' },
    { key: 'channel', label: 'Sales Channel', required: true, synonyms: ['channel', 'source', 'platform', 'marketplace', 'store_name', 'sales_channel'], type: 'string' },
    { key: 'order_value', label: 'Order Gross Value (₹)', required: true, synonyms: ['order_value', 'order value', 'gross_amount', 'total_amount', 'item_price', 'invoice_value', 'total_price'], type: 'number' },
    { key: 'payment_mode', label: 'Payment Mode (COD/Prepaid)', required: true, synonyms: ['payment_mode', 'payment mode', 'payment_method', 'payment_type', 'is_cod', 'pay_type'], type: 'string' },
    { key: 'awb_number', label: 'Courier AWB / Tracking', required: true, synonyms: ['awb_number', 'awb', 'waybill', 'tracking_no', 'tracking_number', 'airway_bill', 'consignment_no'], type: 'string' },
  ],
  SETTLEMENT: [
    { key: 'order_id', label: 'Order ID', required: true, synonyms: ['order_id', 'order id', 'order_no', 'merchant_order_id', 'sub_order_number', 'marketplace_order_id'], type: 'string' },
    { key: 'settlement_amount', label: 'Net Settled Payout (₹)', required: true, synonyms: ['settlement_amount', 'net_amount', 'bank_settlement', 'payout', 'settled_amt', 'net_receivable', 'transferred_amount'], type: 'number' },
    { key: 'commission_fee', label: 'Marketplace Commission (₹)', required: false, synonyms: ['commission_fee', 'commission', 'referral_fee', 'marketplace_fee', 'selling_fee'], type: 'number' },
    { key: 'closing_fee', label: 'Fixed Closing Fee (₹)', required: false, synonyms: ['closing_fee', 'fixed_fee', 'order_processing_fee', 'listing_fee'], type: 'number' },
    { key: 'tcs_amount', label: 'GST TCS (1%) (₹)', required: false, synonyms: ['tcs_amount', 'gst_tcs', 'tcs_cgst_sgst', 'igst_tcs', 'tax_collected_at_source'], type: 'number' },
    { key: 'tds_amount', label: 'Income Tax TDS (Sec 194-O) (₹)', required: false, synonyms: ['tds_amount', 'tds_194o', 'section_194o_tds', 'income_tax_tds', 'tds'], type: 'number' },
  ],
  COD_REMITTANCE: [
    { key: 'order_id', label: 'Order ID', required: true, synonyms: ['order_id', 'order id', 'merchant_ref', 'client_order_no', 'client_order_id'], type: 'string' },
    { key: 'awb_number', label: 'AWB Number', required: true, synonyms: ['awb_number', 'awb', 'waybill', 'cr_awb', 'consignment_id'], type: 'string' },
    { key: 'cod_collected_amount', label: 'COD Cash Collected (₹)', required: true, synonyms: ['cod_collected_amount', 'cod_collected', 'collected_amount', 'cod_amount', 'cash_collected'], type: 'number' },
    { key: 'net_remitted_amount', label: 'Net Bank Remitted Amount (₹)', required: true, synonyms: ['net_remitted_amount', 'net_remitted', 'remitted_amt', 'bank_credit_amount', 'net_payable'], type: 'number' },
  ],
};

function calculateSimilarity(strA, strB) {
  const normA = strA.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normB = strB.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normA === normB) return 1.0;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  const wordsA = strA.toLowerCase().split(/[\s_\-]+/);
  const wordsB = strB.toLowerCase().split(/[\s_\-]+/);
  const common = wordsA.filter(w => wordsB.includes(w) && w.length > 2);
  if (common.length > 0) {
    return 0.7 + (common.length * 0.1);
  }

  return 0.0;
}

export function proposeColumnMapping(sourceType, uploadedHeaders, sampleRows = []) {
  const schema = CANONICAL_SCHEMAS[sourceType] || CANONICAL_SCHEMAS.ORDER_MASTER;
  const proposedMapping = {};
  const confidenceScores = {};
  const usedHeaders = new Set();

  schema.forEach(fieldDef => {
    let bestHeader = '';
    let highestScore = 0;

    uploadedHeaders.forEach(header => {
      if (usedHeaders.has(header)) return;

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

  const previewRows = sampleRows.slice(0, 20).map((row, idx) => {
    const canonicalRow = { _rowIndex: idx + 1 };
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

export function approveAndSaveMapping(currentConfig, newMappings, approvedBy, approvalNote) {
  const currentVersion = currentConfig.version || 1;

  const historyEntry = {
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

export function rollbackMappingVersion(currentConfig, targetVersion, rolledBackBy) {
  const targetHistoryItem = currentConfig.versionHistory.find(v => v.version === targetVersion);
  if (!targetHistoryItem) {
    throw new Error(`Mapping version v${targetVersion} not found in history`);
  }

  const archiveCurrent = {
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
