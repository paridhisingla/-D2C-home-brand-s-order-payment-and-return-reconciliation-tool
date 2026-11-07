// tests/benchmark.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { runHighSpeedOneLakhBenchmark } from '../src/lib/benchmarkEngine.mjs';

test('1. Hard Requirement: Reconciles 100,000 rows in under 60 seconds', () => {
  const result = runHighSpeedOneLakhBenchmark(100000);

  assert.equal(result.totalRowsProcessed, 100000, 'Must process exactly 100,000 rows');
  assert.ok(result.elapsedSeconds < 60.0, `Must complete in under 60 seconds (Actual: ${result.elapsedSeconds}s)`);
  assert.equal(result.meetsSla, true, 'SLA must be strictly true');
  assert.ok(result.rowsPerSecond > 10000, `Throughput should exceed 10,000 rows/sec (Actual: ${result.rowsPerSecond} rows/sec)`);

  // Verify status categorization integrity
  const totalCategorized = result.matchedCount + result.shortPaidCount + result.unpaidCodCount + result.freightOverchargeCount + result.lostReturnCount;
  assert.equal(totalCategorized, 100000, 'All 100,000 rows must be accurately categorized into one of 5 statuses');
});
