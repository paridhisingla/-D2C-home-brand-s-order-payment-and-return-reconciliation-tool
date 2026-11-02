/**
 * Unit Tests for Run-Rate Delay Projection Engine
 * Tests the core mathematical logic for Tiruppur knitwear order tracking.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWorkingDays,
  addWorkingDays,
  computeRunRate,
} from '../src/lib/runRateEngine.mjs';

test('Working days calculation skips Sundays', () => {
  // 2026-11-02 is Monday. 2026-11-08 is Sunday.
  const monday = new Date('2026-11-02T00:00:00Z');
  const nextMonday = new Date('2026-11-09T00:00:00Z');

  const days = calculateWorkingDays(monday, nextMonday);
  // Mon, Tue, Wed, Thu, Fri, Sat = 6 working days (Sunday skipped)
  assert.equal(days, 6);
});

test('Working days returns 0 when end date is past or same day', () => {
  const d1 = new Date('2026-11-10T00:00:00Z');
  const d2 = new Date('2026-11-05T00:00:00Z');
  assert.equal(calculateWorkingDays(d1, d2), 0);
  assert.equal(calculateWorkingDays(d1, d1), 0);
});

test('Run-rate calculation for B-PO-88213 (Company B)', () => {
  // PO: B-PO-88213, Total: 12000, Done: 6800, Ex-factory: 2026-11-20
  // Remaining: 5200 pcs
  const asOf = '2026-11-02';
  const exFactory = '2026-11-20';

  const result = computeRunRate({
    totalQuantity: 12000,
    currentStageQuantity: 6800,
    exFactoryDate: exFactory,
    asOfDate: asOf,
    orderValueInr: 2520000,
    recentLogs: [
      { date: '2026-10-31', quantityProduced: 420 },
      { date: '2026-11-01', quantityProduced: 380 },
      { date: '2026-11-02', quantityProduced: 410 },
    ],
  });

  assert.equal(result.piecesRemaining, 5200);
  assert.equal(result.completionPercentage, 57);

  // Average actual run-rate: (420 + 380 + 410) / 3 = 403 pcs/day
  assert.equal(result.piecesMadePerDay, 403);

  // Working days from Nov 2 to Nov 20: 16 working days
  assert.equal(result.daysRemaining, 16);

  // Required rate: ceil(5200 / 16) = 325 pcs/day
  assert.equal(result.piecesNeededPerDay, 325);

  // Deficit: 325 - 403 = -78 (surplus of 78 pcs/day)
  assert.equal(result.runRateDeficit, -78);

  // Status should be GREEN because actual > needed
  assert.equal(result.statusColor, 'GREEN');
  assert.equal(result.projectedDelayDays, 0);
});

test('Run-rate calculation flags critical RED delay and air freight penalty when pace lags', () => {
  // Remaining: 5000 pcs, 5 days left, but only making 400 pcs/day
  // Days needed: ceil(5000 / 400) = 13 days => 8 days delay!
  const result = computeRunRate({
    totalQuantity: 10000,
    currentStageQuantity: 5000,
    exFactoryDate: '2026-11-08',
    asOfDate: '2026-11-02',
    orderValueInr: 2100000,
    recentLogs: [{ date: '2026-11-02', quantityProduced: 400 }],
  });

  assert.equal(result.statusColor, 'RED');
  assert.ok(result.projectedDelayDays >= 4);
  // Should trigger air freight penalty of ₹3.5L and 5% discount
  assert.equal(result.financialRisk.potentialAirFreightPenalty, 350000);
  assert.equal(result.financialRisk.potentialDiscountPenalty, 105000);
});

test('Formula breakdown provides transparent step-by-step arithmetic', () => {
  const result = computeRunRate({
    totalQuantity: 8000,
    currentStageQuantity: 5200,
    exFactoryDate: '2026-11-12',
    asOfDate: '2026-11-02',
    orderValueInr: 1840000,
    recentLogs: [{ date: '2026-11-02', quantityProduced: 700 }],
  });

  assert.ok(result.formulaBreakdown.remainingPcsStep.includes('2,800 pcs remaining'));
  assert.ok(result.formulaBreakdown.requiredRateStep.includes('pcs/day required'));
  assert.ok(result.formulaBreakdown.actualRateStep.includes('700 pcs/day'));
});
