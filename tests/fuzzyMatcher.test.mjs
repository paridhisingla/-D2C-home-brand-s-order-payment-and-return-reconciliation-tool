// tests/fuzzyMatcher.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  suggestMatchForOrphanedTransaction,
  createReviewQueueItem,
} from '../src/lib/aiFuzzyMatcher.mjs';

test('1. Fuzzy Matcher: Matches orphaned payment by AWB, amount, and date window', () => {
  const candidateOrders = [
    {
      orderId: 'ORD-W-204118',
      channel: 'Website',
      courierPartner: 'Shiprocket',
      awbNumber: 'SR-BLR-892104118',
      expectedReceived: 1409,
      orderValue: 1499,
      orderDate: '2026-10-18T10:30:00Z',
    },
    {
      orderId: 'ORD-M-88120',
      channel: 'Marketplace 1',
      courierPartner: 'Delhivery',
      awbNumber: 'DEL-AMZ-77188120',
      expectedReceived: 899,
      orderValue: 1199,
      orderDate: '2026-10-22T14:15:00Z',
    },
  ];

  const orphanedTx = {
    id: 'tx-unknown-01',
    partner: 'Delhivery',
    rawPaymentRef: 'CR/DEL/COD/204118/BLR',
    rawAwb: 'SR-BLR-892104118',
    rawAmount: 1409,
    transactionDate: '2026-10-24T12:00:00Z',
  };

  const match = suggestMatchForOrphanedTransaction(orphanedTx, candidateOrders);

  assert.equal(match.suggestedOrderId, 'ORD-W-204118', 'Should correlate with ORD-W-204118');
  assert.ok(match.confidenceScore >= 90, `Confidence score should be high (got ${match.confidenceScore}%)`);
  assert.ok(match.matchReasons.some(r => r.includes('AWB Match')), 'Must include AWB match signal');
});

test('2. Review Queue Rule: Item is initialized as PENDING and never automatically closed', () => {
  const candidateOrders = [
    {
      orderId: 'ORD-W-204118',
      channel: 'Website',
      courierPartner: 'Shiprocket',
      awbNumber: 'SR-BLR-892104118',
      expectedReceived: 1409,
      orderValue: 1499,
      orderDate: '2026-10-18T10:30:00Z',
    },
  ];

  const orphanedTx = {
    id: 'tx-unknown-02',
    partner: 'Shiprocket',
    rawPaymentRef: 'SR-CR-REF',
    rawAwb: 'SR-BLR-892104118',
    rawAmount: 1409,
    transactionDate: '2026-10-23T10:00:00Z',
  };

  const queueItem = createReviewQueueItem(orphanedTx, candidateOrders);

  assert.equal(queueItem.status, 'PENDING', 'Item status must strictly start as PENDING');
  assert.equal(queueItem.reviewedBy, null, 'Must have null reviewedBy until human executive acts');
  assert.equal(queueItem.suggestedOrderId, 'ORD-W-204118');
});
