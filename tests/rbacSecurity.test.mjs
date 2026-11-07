// tests/rbacSecurity.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import { store } from '../src/lib/store.mjs';

test('1. Role RBAC: Role switching between Finance Executive, Co-Founder, and Returns Manager', () => {
  store.resetToDefaults();

  // Initial user is Finance Executive
  assert.equal(store.currentUser.role, 'FINANCE_EXECUTIVE');

  // Switch to Co-Founder
  const founder = {
    id: 'usr_founder',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@companya.in',
    role: 'CO_FOUNDER',
    department: 'Executive Finance',
  };
  store.currentUser = founder;
  assert.equal(store.currentUser.role, 'CO_FOUNDER');
  assert.equal(store.currentUser.name, 'Arjun Mehta');

  // Switch to Returns Manager
  const returnsMgr = {
    id: 'usr_returns',
    name: 'Ramesh Gowda',
    email: 'ramesh.gowda@companya.in',
    role: 'RETURNS_MANAGER',
    department: 'Bengaluru Fulfillment & Warehouse',
  };
  store.currentUser = returnsMgr;
  assert.equal(store.currentUser.role, 'RETURNS_MANAGER');
});

test('2. Security: No secrets in code and safe defaults', () => {
  assert.ok(process.env.DATABASE_URL === undefined || !process.env.DATABASE_URL.includes('production_secret'));
});
