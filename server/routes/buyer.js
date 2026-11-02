const express = require('express');
const Order = require('../models/Order');
const StageUpdate = require('../models/StageUpdate');
const Buyer = require('../models/Buyer');
const { verifyBuyerToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/buyer/orders
 * Returns orders for the authenticated buyer ONLY (strictly isolated)
 */
router.get('/orders', verifyBuyerToken, async (req, res) => {
  try {
    const buyerId = req.buyer.buyerId;

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) return res.status(404).json({ success: false, error: 'Buyer not found' });

    // Strict tenant filter: only orders for this buyer
    const orders = await Order.find({ buyerId }).select(
      'poNumber style styleCode fabric totalQuantity exFactoryDate shipWeek currentStage currentStageQuantity statusColor milestones dateHistory'
    );

    res.json({
      success: true,
      buyer: {
        name: buyer.name,
        country: buyer.country,
        code: buyer.code,
      },
      orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/buyer/orders/:poNumber
 * Returns a single PO with milestones and verified photos ONLY
 */
router.get('/orders/:poNumber', verifyBuyerToken, async (req, res) => {
  try {
    const buyerId = req.buyer.buyerId;

    const order = await Order.findOne({
      poNumber: req.params.poNumber.toUpperCase(),
      buyerId, // Mandatory isolation check!
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or does not belong to your buyer sourcing account.',
      });
    }

    // Retrieve confirmed updates with photos only (quarantined unconfirmed notes are excluded!)
    const verifiedUpdates = await StageUpdate.find({
      orderId: order._id,
      status: 'confirmed',
    }).select('stage quantityProduced photoUrl aiEnglishTranslation merchandiserComments createdAt');

    res.json({
      success: true,
      order: {
        poNumber: order.poNumber,
        style: order.style,
        styleCode: order.styleCode,
        fabric: order.fabric,
        totalQuantity: order.totalQuantity,
        exFactoryDate: order.exFactoryDate,
        shipWeek: order.shipWeek,
        currentStage: order.currentStage,
        currentStageQuantity: order.currentStageQuantity,
        statusColor: order.statusColor,
        milestones: order.milestones,
        dateHistory: order.dateHistory,
      },
      verifiedPhotosAndNotes: verifiedUpdates,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
