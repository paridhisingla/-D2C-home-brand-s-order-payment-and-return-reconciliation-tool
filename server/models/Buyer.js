const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    contactEmail: { type: String, required: true },
    tokenSecret: { type: String, required: true }, // Used for tokenized read-only link verification
  },
  { timestamps: true }
);

module.exports = mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);
