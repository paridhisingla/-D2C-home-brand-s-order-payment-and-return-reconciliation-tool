// tests/dpdpCompliance.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  maskName,
  maskPhone,
  maskAddress,
  sanitizeOrderPII,
} from '../src/lib/dpdpMasker.mjs';

test('1. DPDP Masking: Masks customer name initials', () => {
  const masked = maskName('Ananya Sharma');
  assert.equal(masked, 'A**** S****', 'Name should be masked keeping initials');

  const single = maskName('Priya');
  assert.equal(single, 'P****');
});

test('2. DPDP Masking: Masks phone number keeping prefix and suffix', () => {
  const masked = maskPhone('+91 98450 12891');
  assert.ok(masked.includes('****'), 'Phone must obscure central digits');
  assert.ok(masked.startsWith('+91 984'), 'Keeps routing prefix');
  assert.ok(masked.endsWith('891'), 'Keeps last 3 digits');
});

test('3. DPDP Masking: Masks dwelling and house numbers', () => {
  const masked = maskAddress('Flat 402, Prestige Palms, Whitefield, Bengaluru 560066');
  assert.ok(!masked.includes('Flat 402'), 'Must strip house/flat number');
  assert.ok(masked.includes('Prestige Palms'), 'Retains locality for delivery verification');
});

test('4. DPDP Switch: Toggles between masked and unmasked mode', () => {
  const order = {
    customerName: 'Karthik Ramanathan',
    customerPhone: '+91 97112 44901',
    customerAddress: '12, 4th Cross, Koramangala, Bengaluru',
  };

  const masked = sanitizeOrderPII(order, true);
  assert.equal(masked.isMasked, true);
  assert.equal(masked.name, 'K**** R****');

  const unmasked = sanitizeOrderPII(order, false);
  assert.equal(unmasked.isMasked, false);
  assert.equal(unmasked.name, 'Karthik Ramanathan');
});
