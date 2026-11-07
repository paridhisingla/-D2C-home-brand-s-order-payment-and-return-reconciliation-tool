// tests/aiMapping.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  proposeColumnMapping,
  approveAndSaveMapping,
  rollbackMappingVersion,
} from '../src/lib/aiMappingEngine.mjs';

test('1. AI Column Mapping: Correctly maps mutated Amazon MTR headers', () => {
  const mutatedHeaders = [
    'merchant_order_id',
    'net_payout_amount',
    'referral_fee_amount',
    'fixed_closing_fee',
    'gst_tcs_cgst_sgst',
    'income_tax_tds_194o',
  ];

  const proposal = proposeColumnMapping('SETTLEMENT', mutatedHeaders);

  assert.equal(proposal.proposedMapping['order_id'], 'merchant_order_id');
  assert.equal(proposal.proposedMapping['settlement_amount'], 'net_payout_amount');
  assert.equal(proposal.proposedMapping['commission_fee'], 'referral_fee_amount');
  assert.equal(proposal.proposedMapping['closing_fee'], 'fixed_closing_fee');
  assert.equal(proposal.proposedMapping['tcs_amount'], 'gst_tcs_cgst_sgst');
  assert.equal(proposal.proposedMapping['tds_amount'], 'income_tax_tds_194o');
});

test('2. 20-Row Preview Generation', () => {
  const sampleHeaders = ['client_order_id', 'airway_bill_no', 'collected_amount', 'credit_amount'];
  const sampleRows = [];
  for (let i = 1; i <= 25; i++) {
    sampleRows.push({
      client_order_id: `ORD-${1000 + i}`,
      airway_bill_no: `AWB-${2000 + i}`,
      collected_amount: 1499,
      credit_amount: 1409,
    });
  }

  const proposal = proposeColumnMapping('COD_REMITTANCE', sampleHeaders, sampleRows);

  assert.equal(proposal.samplePreview.length, 20, 'Preview must strictly contain 20 rows');
  assert.equal(proposal.samplePreview[0].order_id, 'ORD-1001');
  assert.equal(proposal.samplePreview[0].cod_collected_amount, 1499);
});

test('3. Mapping Versioning and 1-Click Rollback', () => {
  const configV1 = {
    id: 'map-test-01',
    sourceType: 'SETTLEMENT',
    partnerName: 'Amazon',
    version: 1,
    mappings: { order_id: 'order_no', settlement_amount: 'payout' },
    isApproved: true,
    approvedBy: 'Priya Nair',
    approvedAt: '2026-10-01T10:00:00Z',
    versionHistory: [],
  };

  // Upgrade to v2
  const newMappings = { order_id: 'merchant_order_id', settlement_amount: 'net_payout_amount' };
  const configV2 = approveAndSaveMapping(configV1, newMappings, 'Priya Nair', 'Amazon MTR format change');

  assert.equal(configV2.version, 2, 'Version should increment to 2');
  assert.equal(configV2.mappings.order_id, 'merchant_order_id');
  assert.equal(configV2.versionHistory.length, 1, 'v1 should be archived in history');
  assert.equal(configV2.versionHistory[0].mappings.order_id, 'order_no');

  // Roll back to v1
  const rolledBack = rollbackMappingVersion(configV2, 1, 'Priya Nair');
  assert.equal(rolledBack.version, 1, 'Version should be rolled back to 1');
  assert.equal(rolledBack.mappings.order_id, 'order_no', 'Mappings should revert to v1 state');
});
