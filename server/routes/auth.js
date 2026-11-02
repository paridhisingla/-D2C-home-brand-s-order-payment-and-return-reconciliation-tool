const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Buyer = require('../models/Buyer');
const { generateToken } = require('../middleware/auth');
const { LoginSchema, validateBody } = require('../middleware/validation');

const router = express.Router();

// Rate limiting strictly for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login attempts per windowMs
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Role-based authentication returning JWT
 */
router.post('/login', loginLimiter, validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    // Check if buyer portal access request
    const buyer = await Buyer.findOne({ contactEmail: email.toLowerCase() });
    if (buyer) {
      // Generate a tokenized read-only link token for this buyer
      const token = generateToken({ buyerId: buyer._id, role: 'buyer', name: buyer.name });
      return res.json({
        success: true,
        user: {
          id: buyer._id,
          name: buyer.name,
          email: buyer.contactEmail,
          role: 'buyer',
          country: buyer.country,
        },
        token,
        readOnlyLink: `/buyer?token=${token}`,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      unitAssigned: user.unitAssigned,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference,
        unitAssigned: user.unitAssigned,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

/**
 * GET /api/auth/buyer-link/:buyerId
 * Generates a signed tokenized read-only link for a buyer
 */
router.get('/buyer-link/:buyerId', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.buyerId);
    if (!buyer) return res.status(404).json({ success: false, error: 'Buyer not found' });

    const token = generateToken({ buyerId: buyer._id, role: 'buyer', name: buyer.name });
    res.json({
      success: true,
      token,
      url: `/buyer?token=${token}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
