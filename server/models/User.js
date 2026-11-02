const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['merchandiser', 'supervisor', 'admin'], default: 'merchandiser' },
    languagePreference: { type: String, enum: ['ta', 'en'], default: 'ta' },
    unitAssigned: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
