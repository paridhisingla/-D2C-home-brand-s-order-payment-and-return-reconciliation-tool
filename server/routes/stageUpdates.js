const express = require('express');
const multer = require('multer');
const Order = require('../models/Order');
const StageUpdate = require('../models/StageUpdate');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  StageUpdateSchema,
  WarningConfirmSchema,
  validateBody,
} = require('../middleware/validation');
const { classifyTamilNote } = require('../../src/lib/aiClassifier.mjs');
const { computeRunRate } = require('../../src/lib/runRateEngine.mjs');

const router = express.Router();

// Configure Multer for secure photo uploads: 5MB size limit & image mime types only
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB maximum file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE: Only image uploads (JPEG, PNG, WebP) are permitted.'), false);
    }
  },
});

/**
 * POST /api/stage-updates
 * Submits daily floor stage updates with idempotent clientUuid deduplication.
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['supervisor', 'merchandiser', 'admin']),
  validateBody(StageUpdateSchema),
  async (req, res) => {
    try {
      const data = req.validatedBody;

      // Idempotency check: if clientUuid already exists (e.g. mobile resent offline queue), return existing record
      const existing = await StageUpdate.findOne({ clientUuid: data.clientUuid });
      if (existing) {
        return res.status(200).json({
          success: true,
          idempotent: true,
          message: 'Update previously recorded with clientUuid',
          stageUpdate: existing,
        });
      }

      const order = await Order.findById(data.orderId);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      // Run AI Tamil note classifier
      const aiResult = classifyTamilNote(data.originalTamilNote || '');

      const stageUpdate = new StageUpdate({
        clientUuid: data.clientUuid,
        orderId: order._id,
        supervisorId: req.user.userId,
        stage: data.stage,
        quantityProduced: data.quantityProduced,
        rejectedQuantity: data.rejectedQuantity || 0,
        photoUrl: data.photoUrl || null,
        originalTamilNote: data.originalTamilNote || null,
        aiEnglishTranslation: aiResult.englishTranslation,
        aiReasonCategory: aiResult.predictedCategory,
        aiConfidence: aiResult.confidence,
        needsReview: aiResult.needsReview || aiResult.confidence < 0.75,
        status: 'pending', // Quarantined from buyer until confirmed
      });

      await stageUpdate.save();

      // Update Order stage and totals
      order.currentStage = data.stage;
      order.currentStageQuantity = (order.currentStageQuantity || 0) + data.quantityProduced;

      // Update corresponding milestone progress
      const milestone = order.milestones.find((m) =>
        m.stage.toLowerCase().includes(data.stage.toLowerCase())
      );
      if (milestone) {
        milestone.completedQty = (milestone.completedQty || 0) + data.quantityProduced;
        if (milestone.completedQty >= milestone.targetQty) {
          milestone.status = 'COMPLETED';
        } else {
          milestone.status = 'IN_PROGRESS';
        }
      }

      // Recalculate run-rate
      const recentUpdates = await StageUpdate.find({ orderId: order._id });
      const runRate = computeRunRate({
        totalQuantity: order.totalQuantity,
        currentStageQuantity: order.currentStageQuantity,
        exFactoryDate: order.exFactoryDate,
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

      res.status(201).json({
        success: true,
        idempotent: false,
        stageUpdate,
        updatedOrder: order,
        runRateMath: runRate,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/stage-updates/warnings
 * Lists AI warnings and pending floor logs for Merchandiser review
 */
router.get(
  '/warnings',
  authenticateToken,
  requireRole(['merchandiser', 'admin']),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;

      const warnings = await StageUpdate.find(filter)
        .populate('orderId', 'poNumber style totalQuantity currentStage exFactoryDate')
        .populate('supervisorId', 'name email')
        .sort({ createdAt: -1 });

      res.json({ success: true, count: warnings.length, warnings });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * POST /api/stage-updates/:id/confirm
 * Merchandiser confirms, modifies AI category, and publishes to buyer
 */
router.post(
  '/:id/confirm',
  authenticateToken,
  requireRole(['merchandiser', 'admin']),
  validateBody(WarningConfirmSchema),
  async (req, res) => {
    try {
      const { overrideCategory, comments, confirmed } = req.validatedBody;

      const update = await StageUpdate.findById(req.params.id);
      if (!update) return res.status(404).json({ success: false, error: 'Stage update not found' });

      update.status = confirmed ? 'confirmed' : 'rejected';
      if (overrideCategory) {
        update.merchandiserOverrideCategory = overrideCategory;
      }
      if (comments) {
        update.merchandiserComments = comments;
      }
      update.confirmedBy = req.user.userId;
      update.confirmedAt = new Date();
      update.needsReview = false;

      await update.save();

      res.json({
        success: true,
        message: 'Warning review recorded; now visible in buyer portal.',
        stageUpdate: update,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * POST /api/stage-updates/upload-photo
 * Handles photo uploads with type and 5MB size limit validation
 */
router.post(
  '/upload-photo',
  authenticateToken,
  upload.single('photo'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No photo uploaded' });
    }
    // Return sample or path
    const photoUrl = `/uploads/${req.file.filename || 'sample-photo.jpg'}`;
    res.json({ success: true, photoUrl });
  }
);

module.exports = router;
