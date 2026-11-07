// src/lib/benchmarkEngine.mjs
// High-Throughput In-Memory 1-Lakh Row Reconciliation Engine
// Hard Requirement: Reconcile 100,000 rows in under 60 seconds

export function generateSyntheticOneLakhDataset(count = 100000) {
  const orders = new Array(count);
  const settlements = new Array(count);

  const channels = ['Website', 'Marketplace 1', 'Marketplace 2', 'Marketplace 3', 'Quick-Commerce 1', 'Quick-Commerce 2'];
  const couriers = ['Shiprocket', 'Delhivery'];
  const zones = ['Local', 'Regional', 'Metro', 'National'];

  for (let i = 0; i < count; i++) {
    const orderId = `ORD-LAKH-${100000 + i}`;
    const awb = `AWB-SR-${90000000 + i}`;
    const channel = channels[i % channels.length];
    const courier = couriers[i % couriers.length];
    const isCod = (i % 2 === 0);
    const orderValue = 1200 + ((i * 37) % 1800);
    const weightKg = 0.85 + ((i % 5) * 0.1);
    const zone = zones[i % zones.length];

    let deliveryStatus = 'Delivered';
    if (i % 10 === 0) deliveryStatus = 'Returned to warehouse';
    else if (i % 50 === 0) deliveryStatus = 'Lost in transit';

    orders[i] = {
      orderId,
      channel,
      orderValue,
      paymentMode: isCod ? 'COD' : 'Prepaid',
      deliveryStatus,
      courier,
      weightKg,
      zone,
      awb,
    };

    let amountReceived = 0;
    let billedWeightKg = weightKg;

    if (deliveryStatus === 'Returned to warehouse') {
      amountReceived = -96;
      if (i % 4 === 0) {
        billedWeightKg = weightKg + 0.8;
        amountReceived = -142;
      }
    } else if (isCod && (i % 12 === 0)) {
      amountReceived = 0;
    } else if (i % 7 === 0) {
      const roughCommission = orderValue * 0.15;
      amountReceived = orderValue - roughCommission - 62 - (isCod ? 35 : 0) - 45;
    } else {
      const roughCommission = channel === 'Website' ? 0 : orderValue * 0.14;
      const freight = zone === 'Metro' ? 55 : (zone === 'Local' ? 38 : 75);
      const codFee = isCod ? 35 : 0;
      const tcs = channel === 'Website' ? 0 : orderValue * 0.01;
      amountReceived = Math.round(orderValue - roughCommission - freight - codFee - tcs);
    }

    settlements[i] = {
      orderId,
      awb,
      amountReceived,
      billedWeightKg,
    };
  }

  return { orders, settlements };
}

export function runHighSpeedOneLakhBenchmark(count = 100000) {
  const memBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
  const startTime = performance.now();

  const { orders, settlements } = generateSyntheticOneLakhDataset(count);

  const settlementMap = new Map();
  for (let i = 0; i < settlements.length; i++) {
    settlementMap.set(settlements[i].orderId, settlements[i]);
  }

  let matchedCount = 0;
  let shortPaidCount = 0;
  let unpaidCodCount = 0;
  let freightOverchargeCount = 0;
  let lostReturnCount = 0;

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const s = settlementMap.get(o.orderId);

    let commission = 0;
    let tcs = 0;
    if (o.channel !== 'Website') {
      commission = o.orderValue * 0.14;
      tcs = o.orderValue * 0.01;
    }
    const freight = o.zone === 'Metro' ? 55 : (o.zone === 'Local' ? 38 : 75);
    const codFee = o.paymentMode === 'COD' ? 35 : 0;

    let expectedPayout = 0;
    if (o.deliveryStatus === 'Returned to warehouse') {
      expectedPayout = -(freight * 2);
    } else {
      expectedPayout = o.orderValue - commission - freight - codFee - tcs;
    }

    const actual = s ? s.amountReceived : 0;
    const diff = actual - expectedPayout;
    const billedWt = s ? s.billedWeightKg : o.weightKg;

    if (o.deliveryStatus === 'Lost in transit') {
      lostReturnCount++;
    } else if (o.paymentMode === 'COD' && actual === 0 && o.deliveryStatus === 'Delivered') {
      unpaidCodCount++;
    } else if (billedWt > o.weightKg + 0.3) {
      freightOverchargeCount++;
    } else if (diff < -10) {
      shortPaidCount++;
    } else {
      matchedCount++;
    }
  }

  const endTime = performance.now();
  const elapsedMs = Math.round((endTime - startTime) * 100) / 100;
  const elapsedSeconds = Math.round((elapsedMs / 1000) * 1000) / 1000;
  const rowsPerSec = Math.round((count / (elapsedMs / 1000)));

  const memAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
  const memoryUsageMb = Math.round(((memAfter - memBefore) / (1024 * 1024)) * 100) / 100;

  return {
    totalRowsProcessed: count,
    elapsedMilliseconds: elapsedMs,
    elapsedSeconds,
    rowsPerSecond: rowsPerSec,
    matchedCount,
    shortPaidCount,
    unpaidCodCount,
    freightOverchargeCount,
    lostReturnCount,
    memoryUsageMb: Math.max(0, memoryUsageMb),
    meetsSla: elapsedSeconds < 60.0,
  };
}
