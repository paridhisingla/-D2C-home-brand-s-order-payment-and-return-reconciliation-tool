const mongoose = require('mongoose');

const StageUpdateSchema = new mongoose.Schema(
  {
    clientUuid: { type: String, required: true, unique: true }, // Idempotency key from mobile offline sync
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stage: { type: String, required: true },
    quantityProduced: { type: Number, required: true },
    rejectedQuantity: { type: Number, default: 0 },
    photoUrl: { type: String, default: null },
    originalTamilNote: { type: String, default: null },
    aiEnglishTranslation: { type: String, default: null },
    aiReasonCategory: { type: String, default: 'Normal Production / No Issue' },
    aiConfidence: { type: Number, default: 0.9 },
    needsReview: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    merchandiserOverrideCategory: { type: String, default: null },
    merchandiserComments: { type: String, default: null },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StageUpdate || mongoose.model('StageUpdate', StageUpdateSchema);
