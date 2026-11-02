/**
 * Unified Database & Data Access Layer (ESM)
 */

import { computeRunRate } from './runRateEngine.mjs';
import { classifyTamilNote } from './aiClassifier.mjs';
import {
  INITIAL_BUYERS,
  INITIAL_UNITS,
  INITIAL_USERS,
  SAMPLE_ORDERS,
  STANDARD_TNA_STAGES,
} from './sampleData.mjs';

let globalStore = globalThis.__KNIT_TRACK_STORE || {
  buyers: [],
  units: [],
  users: [],
  orders: [],
  logs: [],
  audits: [],
  initialized: false,
};

globalThis.__KNIT_TRACK_STORE = globalStore;

export function initializeStore() {
  if (globalStore.initialized) return;

  globalStore.buyers = JSON.parse(JSON.stringify(INITIAL_BUYERS));
  globalStore.units = JSON.parse(JSON.stringify(INITIAL_UNITS));
  globalStore.users = JSON.parse(JSON.stringify(INITIAL_USERS));
  globalStore.logs = [];
  globalStore.audits = [];

  globalStore.orders = SAMPLE_ORDERS.map((sampleOrder) => {
    const exDate = new Date(sampleOrder.exFactoryDate);

    const milestones = STANDARD_TNA_STAGES.map((stage, idx) => {
      const plannedEnd = new Date(exDate);
      plannedEnd.setDate(plannedEnd.getDate() - stage.daysBeforeExFactory + stage.durationDays);
      const plannedStart = new Date(exDate);
      plannedStart.setDate(plannedStart.getDate() - stage.daysBeforeExFactory);

      const isFinished = idx < 5;
      const isInProgress = stage.name.toLowerCase().includes(sampleOrder.currentStage.toLowerCase());

      return {
        id: `ms-${sampleOrder.id}-${idx}`,
        sequenceOrder: idx + 1,
        stageName: stage.name,
        plannedStartDate: plannedStart.toISOString().split('T')[0],
        plannedEndDate: plannedEnd.toISOString().split('T')[0],
        targetQty: sampleOrder.totalQuantity,
        completedQty: isFinished ? sampleOrder.totalQuantity : isInProgress ? sampleOrder.currentStageQuantity : 0,
        status: isFinished ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'PENDING',
      };
    });

    const runRate = computeRunRate({
      totalQuantity: sampleOrder.totalQuantity,
      currentStageQuantity: sampleOrder.currentStageQuantity,
      exFactoryDate: sampleOrder.exFactoryDate,
      orderValueInr: sampleOrder.orderValueInr,
      recentLogs: sampleOrder.productionLogs.map((l) => ({
        date: l.date,
        quantityProduced: l.quantityProduced,
      })),
    });

    sampleOrder.productionLogs.forEach((l) => {
      globalStore.logs.push({
        ...l,
        orderId: sampleOrder.id,
        poNumber: sampleOrder.poNumber,
        unitId: sampleOrder.unitId,
        supervisorId: 'user-super-1',
        createdAt: new Date().toISOString(),
      });
    });

    sampleOrder.dateAudits.forEach((a) => {
      globalStore.audits.push({
        ...a,
        orderId: sampleOrder.id,
      });
    });

    return {
      ...sampleOrder,
      milestones,
      statusColor: runRate.statusColor,
      runRateDeficit: runRate.runRateDeficit,
      piecesNeededPerDay: runRate.piecesNeededPerDay,
      piecesMadePerDay: runRate.piecesMadePerDay,
      projectedDelayDays: runRate.projectedDelayDays,
      projectedCompletionDate: runRate.projectedCompletionDate,
      airFreightRiskAmount: runRate.financialRisk.potentialAirFreightPenalty,
      delayDiscountRiskAmount: runRate.financialRisk.potentialDiscountPenalty,
      totalAtRisk: runRate.financialRisk.totalAtRisk,
      runRateDetails: runRate,
    };
  });

  globalStore.initialized = true;
}

initializeStore();

export async function getOrders(filters = {}) {
  initializeStore();

  let orders = [...globalStore.orders];

  if (filters.buyerCompanyId) {
    orders = orders.filter((o) => o.buyerId === filters.buyerCompanyId);
  }

  if (filters.unitId) {
    orders = orders.filter((o) => o.unitId === filters.unitId);
  }

  if (filters.shipWeek) {
    orders = orders.filter((o) => o.shipWeek === filters.shipWeek);
  }

  if (filters.statusColor) {
    orders = orders.filter((o) => o.statusColor === filters.statusColor);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.poNumber.toLowerCase().includes(q) ||
        o.styleName.toLowerCase().includes(q) ||
        o.styleCode.toLowerCase().includes(q)
    );
  }

  // Sort worst orders first (RED > AMBER > GREEN)
  const colorPriority = { RED: 0, AMBER: 1, GREEN: 2 };
  orders.sort((a, b) => {
    const pA = colorPriority[a.statusColor] ?? 9;
    const pB = colorPriority[b.statusColor] ?? 9;
    if (pA !== pB) return pA - pB;
    return (b.projectedDelayDays || 0) - (a.projectedDelayDays || 0);
  });

  return orders.map((o) => {
    const buyer = globalStore.buyers.find((b) => b.id === o.buyerId);
    const unit = globalStore.units.find((u) => u.id === o.unitId);
    return {
      ...o,
      buyerName: buyer?.name || o.buyerId,
      unitName: unit?.name || o.unitId,
    };
  });
}

export async function getOrderById(idOrPo) {
  initializeStore();
  const order = globalStore.orders.find(
    (o) => o.id === idOrPo || o.poNumber.toUpperCase() === idOrPo.toUpperCase()
  );
  if (!order) return null;

  const buyer = globalStore.buyers.find((b) => b.id === order.buyerId);
  const unit = globalStore.units.find((u) => u.id === order.unitId);
  const orderLogs = globalStore.logs.filter((l) => l.orderId === order.id);
  const orderAudits = globalStore.audits.filter((a) => a.orderId === order.id);

  const runRate = computeRunRate({
    totalQuantity: order.totalQuantity,
    currentStageQuantity: order.currentStageQuantity,
    exFactoryDate: order.exFactoryDate,
    orderValueInr: order.orderValueInr,
    recentLogs: orderLogs.map((l) => ({
      date: l.date,
      quantityProduced: l.quantityProduced,
    })),
  });

  return {
    ...order,
    buyerName: buyer?.name || order.buyerId,
    buyerCountry: buyer?.country || 'UK',
    unitName: unit?.name || order.unitId,
    productionLogs: orderLogs,
    dateAudits: orderAudits,
    runRateDetails: runRate,
  };
}

export async function createOrder(data) {
  initializeStore();

  const id = `ord-${Date.now()}`;
  const exDate = new Date(data.exFactoryDate);
  const orderVal = data.orderValueInr || data.totalQuantity * 210;

  const milestones = STANDARD_TNA_STAGES.map((stage, idx) => {
    const plannedEnd = new Date(exDate);
    plannedEnd.setDate(plannedEnd.getDate() - stage.daysBeforeExFactory + stage.durationDays);
    const plannedStart = new Date(exDate);
    plannedStart.setDate(plannedStart.getDate() - stage.daysBeforeExFactory);

    return {
      id: `ms-${id}-${idx}`,
      sequenceOrder: idx + 1,
      stageName: stage.name,
      plannedStartDate: plannedStart.toISOString().split('T')[0],
      plannedEndDate: plannedEnd.toISOString().split('T')[0],
      targetQty: data.totalQuantity,
      completedQty: 0,
      status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
    };
  });

  const runRate = computeRunRate({
    totalQuantity: data.totalQuantity,
    currentStageQuantity: 0,
    exFactoryDate: data.exFactoryDate,
    orderValueInr: orderVal,
    recentLogs: [],
  });

  const newOrder = {
    id,
    poNumber: data.poNumber.trim().toUpperCase(),
    buyerId: data.buyerId,
    styleName: data.styleName,
    styleCode: data.styleCode || `STY-${Math.floor(100 + Math.random() * 900)}`,
    fabricDescription: data.fabricDescription || '100% Cotton Single Jersey 180 GSM',
    totalQuantity: Number(data.totalQuantity),
    orderValueInr: orderVal,
    exFactoryDate: data.exFactoryDate,
    originalExFactoryDate: data.exFactoryDate,
    shipWeek: data.shipWeek || `2026-W${Math.ceil((exDate.getDate() + 20) / 7)}`,
    unitId: data.unitId,
    currentStage: data.currentStage || 'Knitting',
    currentStageQuantity: 0,
    sizeBreakdown: data.sizeBreakdown || [
      { size: 'M', color: 'Standard', qty: Math.floor(data.totalQuantity * 0.5) },
      { size: 'L', color: 'Standard', qty: Math.floor(data.totalQuantity * 0.5) },
    ],
    milestones,
    statusColor: runRate.statusColor,
    runRateDeficit: runRate.runRateDeficit,
    piecesNeededPerDay: runRate.piecesNeededPerDay,
    piecesMadePerDay: runRate.piecesMadePerDay,
    projectedDelayDays: runRate.projectedDelayDays,
    projectedCompletionDate: runRate.projectedCompletionDate,
    airFreightRiskAmount: runRate.financialRisk.potentialAirFreightPenalty,
    delayDiscountRiskAmount: runRate.financialRisk.potentialDiscountPenalty,
    totalAtRisk: runRate.financialRisk.totalAtRisk,
    productionLogs: [],
    dateAudits: [],
  };

  globalStore.orders.unshift(newOrder);
  return newOrder;
}

export async function addProductionLog(data) {
  initializeStore();

  const orderIndex = globalStore.orders.findIndex(
    (o) => o.id === data.orderId || o.poNumber === data.orderId
  );
  if (orderIndex === -1) throw new Error('Order not found');

  const order = globalStore.orders[orderIndex];
  const aiResult = classifyTamilNote(data.originalTamilNote || '');

  const logId = `log-${Date.now()}`;
  const newLog = {
    id: logId,
    orderId: order.id,
    poNumber: order.poNumber,
    unitId: order.unitId,
    supervisorId: data.supervisorId || 'user-super-1',
    date: new Date().toISOString().split('T')[0],
    stage: data.stage,
    quantityProduced: Number(data.quantityProduced),
    rejectedQuantity: Number(data.rejectedQuantity || 0),
    photoUrl: data.photoUrl || null,
    originalTamilNote: data.originalTamilNote || null,
    voiceAudioUrl: data.voiceAudioUrl || null,
    aiEnglishTranslation: aiResult.englishTranslation,
    aiReasonCategory: aiResult.predictedCategory,
    aiConfidence: aiResult.confidence,
    merchandiserConfirmed: false,
    merchandiserOverrideCategory: null,
    merchandiserComments: null,
    createdAt: new Date().toISOString(),
  };

  globalStore.logs.unshift(newLog);

  order.currentStage = data.stage;
  order.currentStageQuantity = (order.currentStageQuantity || 0) + Number(data.quantityProduced);

  const milestone = order.milestones?.find(
    (m) => m.stageName.toLowerCase().includes(data.stage.toLowerCase())
  );
  if (milestone) {
    milestone.completedQty = (milestone.completedQty || 0) + Number(data.quantityProduced);
    milestone.status =
      milestone.completedQty >= milestone.targetQty ? 'COMPLETED' : 'IN_PROGRESS';
  }

  const orderLogs = globalStore.logs.filter((l) => l.orderId === order.id);
  const runRate = computeRunRate({
    totalQuantity: order.totalQuantity,
    currentStageQuantity: order.currentStageQuantity,
    exFactoryDate: order.exFactoryDate,
    orderValueInr: order.orderValueInr,
    recentLogs: orderLogs.map((l) => ({
      date: l.date,
      quantityProduced: l.quantityProduced,
    })),
  });

  order.statusColor = runRate.statusColor;
  order.runRateDeficit = runRate.runRateDeficit;
  order.piecesNeededPerDay = runRate.piecesNeededPerDay;
  order.piecesMadePerDay = runRate.piecesMadePerDay;
  order.projectedDelayDays = runRate.projectedDelayDays;
  order.projectedCompletionDate = runRate.projectedCompletionDate;
  order.airFreightRiskAmount = runRate.financialRisk.potentialAirFreightPenalty;
  order.delayDiscountRiskAmount = runRate.financialRisk.potentialDiscountPenalty;
  order.totalAtRisk = runRate.financialRisk.totalAtRisk;

  return { log: newLog, updatedOrder: order };
}

export async function updateExFactoryDate(data) {
  initializeStore();

  const orderIndex = globalStore.orders.findIndex(
    (o) => o.id === data.orderId || o.poNumber === data.orderId
  );
  if (orderIndex === -1) throw new Error('Order not found');

  const order = globalStore.orders[orderIndex];
  const oldDate = order.exFactoryDate;
  const newDate = data.newExFactoryDate;

  const dOld = new Date(oldDate);
  const dNew = new Date(newDate);
  const daysDiff = Math.round((dNew.getTime() - dOld.getTime()) / (1000 * 60 * 60 * 24));

  const auditEntry = {
    id: `audit-${Date.now()}`,
    orderId: order.id,
    oldDate,
    newDate,
    daysDiff,
    reason: data.formalReason,
    changedBy: data.changedByName,
    timestamp: new Date().toISOString(),
  };

  globalStore.audits.unshift(auditEntry);
  order.exFactoryDate = newDate;

  const orderLogs = globalStore.logs.filter((l) => l.orderId === order.id);
  const runRate = computeRunRate({
    totalQuantity: order.totalQuantity,
    currentStageQuantity: order.currentStageQuantity,
    exFactoryDate: newDate,
    orderValueInr: order.orderValueInr,
    recentLogs: orderLogs.map((l) => ({
      date: l.date,
      quantityProduced: l.quantityProduced,
    })),
  });

  order.statusColor = runRate.statusColor;
  order.runRateDeficit = runRate.runRateDeficit;
  order.piecesNeededPerDay = runRate.piecesNeededPerDay;
  order.piecesMadePerDay = runRate.piecesMadePerDay;
  order.projectedDelayDays = runRate.projectedDelayDays;
  order.projectedCompletionDate = runRate.projectedCompletionDate;
  order.airFreightRiskAmount = runRate.financialRisk.potentialAirFreightPenalty;
  order.delayDiscountRiskAmount = runRate.financialRisk.potentialDiscountPenalty;
  order.totalAtRisk = runRate.financialRisk.totalAtRisk;

  return { audit: auditEntry, updatedOrder: order };
}

export async function confirmLogReview(data) {
  initializeStore();

  const logIndex = globalStore.logs.findIndex((l) => l.id === data.logId);
  if (logIndex === -1) throw new Error('Log entry not found');

  const log = globalStore.logs[logIndex];
  log.merchandiserConfirmed = data.confirmed;
  if (data.overrideCategory) {
    log.merchandiserOverrideCategory = data.overrideCategory;
  }
  if (data.comments) {
    log.merchandiserComments = data.comments;
  }

  return log;
}

export async function getReviewQueue() {
  initializeStore();
  return globalStore.logs.map((l) => {
    const order = globalStore.orders.find((o) => o.id === l.orderId);
    return {
      ...l,
      orderPoNumber: order?.poNumber || l.orderId,
      orderStyleName: order?.styleName || 'Knitwear Style',
    };
  });
}

export async function getBuyers() {
  initializeStore();
  return globalStore.buyers;
}

export async function getUnits() {
  initializeStore();
  return globalStore.units;
}

export async function resetDatabase() {
  globalStore.initialized = false;
  initializeStore();
  return { message: 'Database reset and seeded with client sample data.' };
}
