// tests/returnsTracker.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { store } from '../src/lib/store.mjs';

test('1. Returns Tracker: Identifies lost return past 7 days', () => {
  store.resetToDefaults();
  const orders = store.getOrders({ maskPII: false });

  // Find ORD-M-90214 (Flipkart lost return)
  const lostOrder = orders.find(o => o.orderId === 'ORD-M-90214');
  assert.ok(lostOrder, 'ORD-M-90214 must exist in store');
  assert.equal(lostOrder.reconciliationStatus, 'Return not received', 'Must be flagged as Return not received');
  assert.equal(lostOrder.warehouseScanDate, null, 'Must be un-scanned at warehouse');
  assert.ok(lostOrder.daysSinceDelivery > 7, 'Must exceed 7 days since RTO');
});

test('2. Returns Tracker: Barcode scan at warehouse dock verifies receipt and clears lost status', () => {
  store.resetToDefaults();
  
  // Record warehouse inward barcode scan for ORD-M-90214
  const scanResult = store.logWarehouseScan('DEL-FK-99021411', 'Good Condition');
  assert.equal(scanResult.success, true, 'Scan must be successful');
  assert.ok(scanResult.order.warehouseScanDate !== null, 'Warehouse scan date must be set');

  const updatedOrder = store.getOrderById('ORD-M-90214');
  assert.notEqual(updatedOrder.reconciliationStatus, 'Return not received', 'With physical receipt confirmed, must clear Return not received');
});
