// tests/rateEngine.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_RATE_CARDS,
  calculateCourierFreight,
  calculateExpectedPayout,
  evaluateReconciliation,
} from '../src/lib/rateEngine.mjs';

test('1. Brief Sample Row 1: ORD-W-204118 (Website COD Unremitted)', () => {
  const sampleOrder = {
    orderId: 'ORD-W-204118',
    channel: 'Website',
    orderValue: 1499,
    paymentMode: 'COD',
    deliveryStatus: 'Delivered',
    courierPartner: 'Shiprocket',
    awbNumber: 'SR-BLR-892104118',
    physicalWeightKg: 0.85,
    billedWeightKg: 0.85,
    actualReceived: 0,
    daysSinceDelivery: 19,
  };

  const result = evaluateReconciliation(sampleOrder, DEFAULT_RATE_CARDS);

  assert.equal(result.expectedReceived, 1409, 'Expected net receivable should be ₹1409');
  assert.equal(result.actualReceived, 0, 'Received amount should be ₹0');
  assert.equal(result.difference, -1409, 'Difference should be -₹1409');
  assert.equal(result.reconciliationStatus, 'Unpaid past due', 'Status must be Unpaid past due');
  assert.equal(result.leakageAmount, 1409, 'Leakage amount must be ₹1409');
  assert.ok(result.leakageReason.includes('COD'), 'Leakage reason should mention COD cash remittance');
});

test('2. Brief Sample Row 2: ORD-M-88120 (Marketplace 1 Short-Paid)', () => {
  const sampleOrder = {
    orderId: 'ORD-M-88120',
    channel: 'Marketplace 1',
    orderValue: 1199,
    paymentMode: 'Prepaid',
    deliveryStatus: 'Delivered',
    courierPartner: 'Delhivery',
    awbNumber: 'DEL-AMZ-77188120',
    physicalWeightKg: 0.95,
    billedWeightKg: 0.95,
    actualReceived: 862,
    daysSinceDelivery: 15,
  };

  const result = evaluateReconciliation(sampleOrder, DEFAULT_RATE_CARDS);

  assert.equal(result.expectedReceived, 899, 'Expected net receivable should be ₹899');
  assert.equal(result.actualReceived, 862, 'Received amount should be ₹862');
  assert.equal(result.difference, -37, 'Difference should be -₹37');
  assert.equal(result.reconciliationStatus, 'Short-paid', 'Status must be Short-paid');
  assert.equal(result.leakageAmount, 37, 'Leakage amount must be ₹37');
  assert.ok(result.leakageReason.includes('commission') || result.leakageReason.includes('fee'), 'Reason should flag commission discrepancy');
});

test('3. Brief Sample Row 3: ORD-W-204377 (Website Return Freight Overcharge)', () => {
  const sampleOrder = {
    orderId: 'ORD-W-204377',
    channel: 'Website',
    orderValue: 2398,
    paymentMode: 'Prepaid',
    deliveryStatus: 'Returned to warehouse',
    courierPartner: 'Shiprocket',
    awbNumber: 'SR-BLR-90204377',
    physicalWeightKg: 0.90,
    billedWeightKg: 1.65,
    actualReceived: -142,
    daysSinceDelivery: 22,
  };

  const result = evaluateReconciliation(sampleOrder, DEFAULT_RATE_CARDS);

  assert.equal(result.expectedReceived, -96, 'Expected payout should be -₹96 (freight absorption)');
  assert.equal(result.actualReceived, -142, 'Received should be -₹142 (overcharge deduction)');
  assert.equal(result.difference, -46, 'Difference should be -₹46');
  assert.equal(result.reconciliationStatus, 'Freight overcharged', 'Status must be Freight overcharged');
  assert.equal(result.leakageAmount, 46, 'Leakage amount must be ₹46');
});

test('4. Gap Threshold Rule: Differences within ±₹10 are marked Settled', () => {
  const orderWith2RupeeDiff = {
    orderId: 'ORD-TEST-001',
    channel: 'Website',
    orderValue: 1899,
    paymentMode: 'Prepaid',
    deliveryStatus: 'Delivered',
    courierPartner: 'Shiprocket',
    physicalWeightKg: 0.5,
    billedWeightKg: 0.5,
    zone: 'Metro',
    actualReceived: 1804,
    daysSinceDelivery: 5,
  };

  const result = evaluateReconciliation(orderWith2RupeeDiff, DEFAULT_RATE_CARDS);

  assert.equal(result.reconciliationStatus, 'Settled', 'Difference within ₹10 must be classified as Settled');
  assert.equal(result.leakageAmount, 0, 'No leakage flagged for variance <= ₹10');
});

test('5. Courier Freight Slab Calculation with incremental 500g steps', () => {
  const freight = calculateCourierFreight('Shiprocket', 1.2, 'Metro', false, DEFAULT_RATE_CARDS);
  assert.equal(freight, 125, '1.2 kg should cost base (55) + 2 extra slabs (70) = ₹125');

  const returnFreight = calculateCourierFreight('Shiprocket', 1.2, 'Metro', true, DEFAULT_RATE_CARDS);
  assert.equal(returnFreight, 250, 'Return freight should double the forward freight');
});
