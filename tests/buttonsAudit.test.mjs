import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';

test('1. Button Audit: Reset Database to Pristine Sample Data (/api/seed)', async () => {
  const res = await fetch(`${BASE_URL}/api/seed`, { method: 'POST' });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.ordersCount >= 3 || data.message);
});

test('2. Button Audit: Sign In Button (/api/auth/login)', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'karthik@tiruppurknitwear.com',
      password: 'demo123',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'MERCHANDISER');
  assert.ok(data.token);
});

test('3. Button Audit: Buyer Access PIN Buttons (/api/auth/buyer-access)', async () => {
  // Test Buyer B PIN
  const resB = await fetch(`${BASE_URL}/api/auth/buyer-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerCodeOrPin: 'BUYER-B-2026' }),
  });
  assert.equal(resB.status, 200);
  const dataB = await resB.json();
  assert.equal(dataB.success, true);
  assert.equal(dataB.buyer.id, 'buyer-b-uk');

  // Test Buyer C PIN
  const resC = await fetch(`${BASE_URL}/api/auth/buyer-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerCodeOrPin: 'BUYER-C-2026' }),
  });
  assert.equal(resC.status, 200);
  const dataC = await resC.json();
  assert.equal(dataC.success, true);
  assert.equal(dataC.buyer.id, 'buyer-c-de');
});

test('4. Button Audit: Create Factory Account Button (/api/auth/register)', async () => {
  const testEmail = `supervisor-${Date.now()}@tiruppurknitwear.com`;
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Selvam (செல்வம்)',
      email: testEmail,
      password: 'password123',
      role: 'SUPERVISOR',
      unitId: 'unit-2',
      languagePreference: 'ta',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'SUPERVISOR');
  assert.equal(data.user.unitId, 'unit-2');
});

test('5. Button Audit: Setup New Order Button (/api/orders)', async () => {
  const po = `TEST-PO-${Date.now().toString().slice(-5)}`;
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      poNumber: po,
      buyerId: 'buyer-b-uk',
      styleName: "Men's V-Neck Tee, Olive",
      styleCode: 'STY-VNK-99',
      fabricDescription: '100% Cotton 190 GSM Bio-Washed',
      totalQuantity: 5000,
      exFactoryDate: '2026-12-20',
      unitId: 'unit-1',
      sizeBreakdown: [
        { size: 'S', color: 'Olive', qty: 1000 },
        { size: 'M', color: 'Olive', qty: 2000 },
        { size: 'L', color: 'Olive', qty: 1500 },
        { size: 'XL', color: 'Olive', qty: 500 },
      ],
    }),
  });
  assert.ok(res.status === 200 || res.status === 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.order.poNumber, po);
  assert.ok(data.order.milestones.length >= 7);
});

test('6. Button Audit: Supervisor Floor Submit Button (/api/logs)', async () => {
  const res = await fetch(`${BASE_URL}/api/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-88213',
      stage: 'Stitching',
      quantityProduced: 650,
      rejectedQuantity: 8,
      originalTamilNote: 'தையல் இயந்திர மோட்டார் பழுதாகிவிட்டது',
      photoUrl: '/sample-photos/stitching-line-1.jpg',
      supervisorId: 'user-super-1',
    }),
  });
  assert.ok(res.status === 200 || res.status === 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.log.aiReasonCategory, 'Machine Breakdown');
  assert.ok(data.log.aiConfidence > 0.5);
});

test('7. Button Audit: AI Review Queue Confirm & Publish Button (/api/logs/[id]/confirm)', async () => {
  const logsRes = await fetch(`${BASE_URL}/api/logs`);
  const logsData = await logsRes.json();
  assert.ok(logsData.logs.length > 0);
  const targetLog = logsData.logs[0];

  const res = await fetch(`${BASE_URL}/api/logs/${targetLog.id}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      confirmed: true,
      overrideCategory: 'Machine Breakdown',
      comments: 'Mechanic replaced sewing motor; line resumed.',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.log.merchandiserConfirmed, true);
});

test('8. Button Audit: Revise Ex-Factory Date Modal Submit (/api/orders/[id]/date)', async () => {
  const res = await fetch(`${BASE_URL}/api/orders/ord-88240/date`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newExFactoryDate: '2026-11-18',
      formalReason: 'Buyer requested revised embroidery patch placement on front collar',
      changedByName: 'Karthik Subramanian (Merchandiser)',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  const updatedOrder = data.order || data.updatedOrder;
  assert.ok(updatedOrder);
  assert.equal(updatedOrder.exFactoryDate, '2026-11-18');
  assert.ok(data.audit.reason.includes('embroidery patch'));
});

test('9. Button Audit: Export CSV Download Button (/api/export)', async () => {
  const res = await fetch(`${BASE_URL}/api/export?buyerCompanyId=buyer-b-uk`);
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-type')?.includes('text/csv'));
  const text = await res.text();
  assert.ok(text.includes('PO Number,Buyer,Garment Style'));
  assert.ok(text.includes('B-PO-88213'));
});

test('10. Button Audit: Order Board Filters (Red, Amber, Green, Unit, ShipWeek)', async () => {
  // Filter RED
  const resRed = await fetch(`${BASE_URL}/api/orders?statusColor=RED`);
  const dataRed = await resRed.json();
  assert.equal(dataRed.success, true);
  dataRed.orders.forEach((o) => assert.equal(o.statusColor, 'RED'));

  // Filter Buyer B
  const resBuyer = await fetch(`${BASE_URL}/api/orders?buyerCompanyId=buyer-b-uk`);
  const dataBuyer = await resBuyer.json();
  assert.equal(dataBuyer.success, true);
  dataBuyer.orders.forEach((o) => assert.equal(o.buyerId, 'buyer-b-uk'));

  // Filter Unit 1
  const resUnit = await fetch(`${BASE_URL}/api/orders?unitId=unit-1`);
  const dataUnit = await resUnit.json();
  assert.equal(dataUnit.success, true);
  dataUnit.orders.forEach((o) => assert.equal(o.unitId, 'unit-1'));
});

test('11. Button Audit: Tamil Voice & NLP Translation Endpoint (/api/ai/classify)', async () => {
  const res = await fetch(`${BASE_URL}/api/ai/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tamilNote: 'பிரிண்டிங் ஸ்கிரீன் மை காயவில்லை',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  const cat = data.classification.category || data.classification.predictedCategory;
  assert.equal(cat, 'Subcontract Printing / Washing Delay');
});
