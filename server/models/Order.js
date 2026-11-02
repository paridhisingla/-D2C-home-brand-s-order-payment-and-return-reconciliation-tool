const mongoose = require('mongoose');

const OrderLineSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  qty: { type: Number, required: true },
  doneQty: { type: Number, default: 0 },
});

const MilestoneSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  sequenceOrder: { type: Number, required: true },
  plannedStart: { type: Date, required: true },
  plannedEnd: { type: Date, required: true },
  targetQty: { type: Number, required: true },
  completedQty: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'], default: 'PENDING' },
});

const DateChangeHistorySchema = new mongoose.Schema({
  oldDate: { type: Date, required: true },
  newDate: { type: Date, required: true },
  daysDiff: { type: Number, required: true },
  reason: { type: String, required: true },
  changedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const OrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    style: { type: String, required: true },
    styleCode: { type: String, default: '' },
    fabric: { type: String, default: '100% Cotton Single Jersey 180 GSM' },
    totalQuantity: { type: Number, required: true },
    orderValueInr: { type: Number, default: 2100000 },
    exFactoryDate: { type: Date, required: true },
    originalExFactoryDate: { type: Date, required: true },
    shipWeek: { type: String, required: true },
    unit: { type: String, required: true }, // e.g. "Unit 1 - Arulpuram", "Subcontract Murugan Printing"
    currentStage: { type: String, default: 'Knitting' },
    currentStageQuantity: { type: Number, default: 0 },
    statusColor: { type: String, enum: ['GREEN', 'AMBER', 'RED'], default: 'GREEN' },
    runRateDeficit: { type: Number, default: 0 },
    piecesNeededPerDay: { type: Number, default: 0 },
    piecesMadePerDay: { type: Number, default: 0 },
    projectedDelayDays: { type: Number, default: 0 },
    lines: [OrderLineSchema],
    milestones: [MilestoneSchema],
    dateHistory: [DateChangeHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
