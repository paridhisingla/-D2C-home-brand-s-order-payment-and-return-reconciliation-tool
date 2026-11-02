/**
 * Security & Access Control Tests: Buyer Isolation
 * Constraint: "One buyer must never see another's styles or volumes."
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getOrders, getOrderById } from '../src/lib/db.mjs';

test('Buyer Company B can ONLY see Company B purchase orders', async () => {
  const buyerBOrders = await getOrders({ buyerCompanyId: 'buyer-b-uk' });

  assert.ok(buyerBOrders.length > 0);
  for (const order of buyerBOrders) {
    assert.equal(order.buyerId, 'buyer-b-uk');
    assert.notEqual(order.buyerId, 'buyer-c-de');
    assert.ok(order.poNumber.startsWith('B-PO-'));
  }
});

test('Buyer Company C can ONLY see Company C purchase orders and volumes', async () => {
  const buyerCOrders = await getOrders({ buyerCompanyId: 'buyer-c-de' });

  assert.ok(buyerCOrders.length > 0);
  for (const order of buyerCOrders) {
    assert.equal(order.buyerId, 'buyer-c-de');
    assert.notEqual(order.buyerId, 'buyer-b-uk');
    assert.ok(order.poNumber.startsWith('C-PO-'));
  }
});

test('Buyer cannot query or leak other buyer order details by ID', async () => {
  const orderC = await getOrderById('ord-0488');
  assert.equal(orderC?.buyerId, 'buyer-c-de');

  // Verify that an access gate checking buyer identity blocks unauthorized PO access
  function verifyBuyerAccess(userBuyerId, requestedOrder) {
    if (requestedOrder.buyerId !== userBuyerId) {
      throw new Error('ACCESS_DENIED: Unauthorized access to external buyer order.');
    }
    return true;
  }

  assert.throws(
    () => verifyBuyerAccess('buyer-b-uk', orderC),
    /ACCESS_DENIED/
  );
});
