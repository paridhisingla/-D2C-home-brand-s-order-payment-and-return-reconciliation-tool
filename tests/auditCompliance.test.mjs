/**
 * Audit Compliance Tests: Ex-Factory Date Changes
 * Brief requirement: "Buyers' compliance teams want a history of every date change."
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { updateExFactoryDate, getOrderById } from '../src/lib/db.mjs';

test('Ex-factory date change records immutable audit log with formal reason', async () => {
  const result = await updateExFactoryDate({
    orderId: 'ord-88213',
    newExFactoryDate: '2026-11-25',
    formalReason: 'Yarn supplier delivered combed lot 5 days late due to spinning mill shutdown.',
    changedByName: 'Karthik Subramanian (Merchandiser)',
  });

  assert.ok(result.audit.id);
  assert.equal(result.audit.oldDate, '2026-11-20');
  assert.equal(result.audit.newDate, '2026-11-25');
  assert.equal(result.audit.daysDiff, 5);
  assert.equal(result.updatedOrder.exFactoryDate, '2026-11-25');

  const order = await getOrderById('ord-88213');
  assert.ok(order?.dateAudits.length > 0);
  const audit = order?.dateAudits[0];
  assert.equal(audit.reason, 'Yarn supplier delivered combed lot 5 days late due to spinning mill shutdown.');
  assert.equal(audit.changedBy, 'Karthik Subramanian (Merchandiser)');
});
