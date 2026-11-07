// tests/taxLedger.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { store } from '../src/lib/store.mjs';

test('1. TCS & TDS Statutory Tax Separation: Verified as Non-Leakage', () => {
  store.resetToDefaults();
  const taxRecords = store.getTaxLedger();

  assert.ok(taxRecords.length >= 3, 'Must contain records for marketplaces and direct channel');

  // Amazon record
  const amz = taxRecords.find(r => r.partner.includes('Amazon'));
  assert.ok(amz, 'Amazon tax record must exist');
  assert.equal(amz.gstTcsDeducted, 125847, '1% GST TCS must match');
  assert.equal(amz.incomeTaxTdsDeducted, 14850, 'Income Tax TDS (0.1% under 194-O) must match');
  assert.equal(amz.portalStatus, 'Reconciled', 'Must be reconciled');

  // Direct Website record
  const site = taxRecords.find(r => r.partner.includes('Website'));
  assert.ok(site, 'Direct website tax record must exist');
  assert.equal(site.gstTcsDeducted, 0, 'Direct D2C site does not deduct marketplace TCS');
  assert.equal(site.incomeTaxTdsDeducted, 0, 'Direct D2C site does not deduct marketplace TDS');
});
