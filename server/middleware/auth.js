const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'knittrack-tiruppur-super-secret-jwt-key-2026';

/**
 * Verifies JWT token and attaches user payload
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Role authorization middleware
 * Supervisor cannot create orders; merchandiser has write access
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `ACCESS_DENIED: Role '${req.user?.role || 'unknown'}' is not authorized for this operation.`,
      });
    }
    next();
  };
}

/**
 * Tokenized Read-Only Link Middleware for Buyers
 * Allows buyers access ONLY to their own orders and milestones.
 */
function verifyBuyerToken(req, res, next) {
  const token = req.query.token || req.headers['x-buyer-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Tokenized read-only link parameter (?token=...) is required for buyer portal access.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.buyerId || decoded.role !== 'buyer') {
      return res.status(403).json({ success: false, error: 'Invalid buyer token authorization.' });
    }
    req.buyer = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Expired or malformed buyer access link.' });
  }
}

function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
  authenticateToken,
  requireRole,
  verifyBuyerToken,
  generateToken,
  JWT_SECRET,
};
