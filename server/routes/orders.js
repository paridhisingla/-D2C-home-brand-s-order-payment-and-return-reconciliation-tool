const express = require('express');
const Order = require('../models/Order');
const StageUpdate = require('../models/StageUpdate');
const Buyer = require('../models/Buyer');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  OrderCreateSchema,
  MilestoneDateChangeSchema,
  validateBody,
} = require('../middleware/validation');
const { computeRunRate } = require('../../src/lib/runRateEngine.mjs');

const router = express.Router();

const STANDARD_TNA_STAGES = [
  { name: 'Yarn Procurement', daysBeforeExFactory: 45, durationDays: 7 },
  { name: 'Knitting', daysBeforeExFactory: 38, durationDays: 6 },
  { name: 'Dyeing', daysBeforeExFactory: 32, durationDays: 7 },
  { name: 'Cutting', daysBeforeExFactory: 25, durationDays: 5 },
  { name: 'Printing / Washing', daysBeforeExFactory: 20, durationDays: 6 },
  { name: 'Stitching', daysBeforeExFactory: 14, durationDays: 8 },
  { name: 'Finishing & Ironing', daysBeforeExFactory: 6, durationDays: 3 },
  { name: 'Packing', daysBeforeExFactory: 3, durationDays: 2 },
  { name: 'Final Inspection & Ex-Factory', daysBeforeExFactory: 1, durationDays: 1 },
];

function generateMilestonesFromExDate(exFactoryDate, totalQuantity) {
  const exDate = new Date(exFactoryDate);
  return STANDARD_TNA_STAGES.map((stage, idx) => {
    const plannedEnd = new Date(exDate);
    plannedEnd.setDate(plannedEnd.getDate() - stage.daysBeforeExFactory + stage.durationDays);
    const plannedStart = new Date(exDate);
    plannedStart.setDate(plannedStart.getDate() - stage.daysBeforeExFactory);

    return {
      stage: stage.name,
      sequenceOrder: idx + 1,
      plannedStart,
      plannedEnd,
      targetQty: totalQuantity,
      completedQty: 0,
      status: idx === 0 ? 'IN_PROGRESS' : 'PENDING',
    };
  });
}

/**
 * GET /api/orders/tna-template?exFactoryDate=YYYY-MM-DD&totalQuantity=10000
 * Generates preview of TNA milestone dates
 */
router.get('/tna-template', (req, res) => {
  const { exFactoryDate, totalQuantity } = req.query;
  if (!exFactoryDate) {
    return res.status(400).json({ success: false, error: 'exFactoryDate is required' });
  }

  const milestones = generateMilestonesFromExDate(
    exFactoryDate,
    Number(totalQuantity) || 10000
  );

  res.json({ success: true, milestones });
});

/**
 * GET /api/orders
 * List orders with filters (buyer, unit, ship week) and sorts worst orders first (RED > AMBER > GREEN)
 */
router.get('/', async (req, res) => {
  try {
    const { buyer, unit, shipWeek, statusColor, search } = req.query;
    const filter = {};

    if (buyer) filter.buyerId = buyer;
    if (unit) filter.unit = new RegExp(unit, 'i');
    if (shipWeek) filter.shipWeek = shipWeek;
    if (statusColor) filter.statusColor = statusColor.toUpperCase();
    if (search) {
      filter.$or = [
        { poNumber: new RegExp(search, 'i') },
        { style: new RegExp(search, 'i') },
        { styleCode: new RegExp(search, 'i') },
      ];
    }

    let orders = await Order.find(filter).populate('buyerId', 'name country code contactEmail');

    // Sort: Worst orders first (RED first, then AMBER, then GREEN)
    const colorPriority = { RED: 0, AMBER: 1, GREEN: 2 };
    orders.sort((a, b) => {
      const pA = colorPriority[a.statusColor] ?? 99;
      const pB = colorPriority[b.statusColor] ?? 99;
      if (pA !== pB) return pA - pB;
      return b.projectedDelayDays - a.projectedDelayDays;
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders/:id
 * Get single order with complete run-rate math breakdown and stage history
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyerId');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const recentUpdates = await StageUpdate.find({ orderId: order._id }).sort({ createdAt: -1 });

    // Live Run-rate computation
    const runRateMath = computeRunRate({
      totalQuantity: order.totalQuantity,
      currentStageQuantity: order.currentStageQuantity,
      exFactoryDate: order.exFactoryDate,
      orderValueInr: order.orderValueInr,
      recentLogs: recentUpdates.map((u) => ({
        date: u.createdAt,
        quantityProduced: u.quantityProduced,
      })),
    });

    res.json({
      success: true,
      order,
      runRateMath,
      recentUpdates,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 * Role Middleware: Supervisor CANNOT create orders. Only Merchandiser can.
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['merchandiser', 'admin']),
  validateBody(OrderCreateSchema),
  async (req, res) => {
    try {
      const data = req.validatedBody;

      // Auto-generate TNA milestones
      const milestones = generateMilestonesFromExDate(data.exFactoryDate, data.totalQuantity);

      // Compute initial run-rate
      const runRate = computeRunRate({
        totalQuantity: data.totalQuantity,
        currentStageQuantity: 0,
        exFactoryDate: data.exFactoryDate,
        orderValueInr: data.orderValueInr || data.totalQuantity * 210,
        recentLogs: [],
      });

      const newOrder = new Order({
        poNumber: data.poNumber,
        buyerId: data.buyerId,
        style: data.style,
        styleCode: data.styleCode || `STY-${Math.floor(100 + Math.random() * 900)}`,
        fabric: data.fabric || '100% Cotton Single Jersey 180 GSM',
        totalQuantity: data.totalQuantity,
        orderValueInr: data.orderValueInr || data.totalQuantity * 210,
        exFactoryDate: data.exFactoryDate,
        originalExFactoryDate: data.exFactoryDate,
        shipWeek: data.shipWeek,
        unit: data.unit,
        currentStage: 'Knitting',
        currentStageQuantity: 0,
        statusColor: runRate.statusColor,
        runRateDeficit: runRate.runRateDeficit,
        piecesNeededPerDay: runRate.piecesNeededPerDay,
        piecesMadePerDay: runRate.piecesMadePerDay,
        projectedDelayDays: runRate.projectedDelayDays,
        lines: data.lines || [
          { color: 'Standard', size: 'M', qty: Math.floor(data.totalQuantity * 0.5) },
          { color: 'Standard', size: 'L', qty: Math.floor(data.totalQuantity * 0.5) },
        ],
        milestones,
        dateHistory: [],
      });

      await newOrder.save();
      res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * POST /api/orders/:id/change-milestone-date
 * Changes ex-factory or milestone date, requires formal reason and writes to dateHistory
 */
router.post(
  '/:id/change-milestone-date',
  authenticateToken,
  requireRole(['merchandiser', 'admin']),
  validateBody(MilestoneDateChangeSchema),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      const { newDate, reason } = req.validatedBody;
      const oldDate = order.exFactoryDate;
      const dOld = new Date(oldDate);
      const dNew = new Date(newDate);
      const daysDiff = Math.round((dNew.getTime() - dOld.getTime()) / (1000 * 60 * 60 * 24));

      const auditRecord = {
        oldDate,
        newDate: dNew,
        daysDiff,
        reason,
        changedBy: req.user.name || 'Karthik Subramanian (Merchandiser)',
        timestamp: new Date(),
      };

      order.dateHistory.unshift(auditRecord);
      order.exFactoryDate = dNew;

      // Recalculate run-rate
      const recentUpdates = await StageUpdate.find({ orderId: order._id });
      const runRate = computeRunRate({
        totalQuantity: order.totalQuantity,
        currentStageQuantity: order.currentStageQuantity,
        exFactoryDate: dNew,
        orderValueInr: order.orderValueInr,
        recentLogs: recentUpdates.map((u) => ({
          date: u.createdAt,
          quantityProduced: u.quantityProduced,
        })),
      });

      order.statusColor = runRate.statusColor;
      order.runRateDeficit = runRate.runRateDeficit;
      order.piecesNeededPerDay = runRate.piecesNeededPerDay;
      order.piecesMadePerDay = runRate.piecesMadePerDay;
      order.projectedDelayDays = runRate.projectedDelayDays;

      await order.save();

      res.json({
        success: true,
        message: 'Milestone ex-factory date updated and stamped into compliance history.',
        auditRecord,
        updatedOrder: order,
        runRateMath: runRate,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = router;
