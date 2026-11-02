const { z } = require('zod');

// Login Input Validation
const LoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

// Order Creation Validation
const OrderCreateSchema = z.object({
  poNumber: z.string().min(3, 'PO Number is required (e.g. B-PO-88213)'),
  buyerId: z.string().min(1, 'Buyer ID is required'),
  style: z.string().min(2, 'Style description is required'),
  styleCode: z.string().optional(),
  fabric: z.string().optional(),
  totalQuantity: z.number().int().positive('Total quantity must be a positive integer'),
  orderValueInr: z.number().positive().optional(),
  exFactoryDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  shipWeek: z.string().min(4, 'Ship week is required (e.g. 2026-W47)'),
  unit: z.string().min(2, 'Assigned production unit is required'),
  lines: z
    .array(
      z.object({
        color: z.string(),
        size: z.string(),
        qty: z.number().int().positive(),
      })
    )
    .optional(),
});

// Milestone Date Revision Validation
const MilestoneDateChangeSchema = z.object({
  newDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  reason: z.string().min(5, 'A formal reason is required for compliance history'),
});

// Stage Update Validation (with idempotent clientUuid)
const StageUpdateSchema = z.object({
  clientUuid: z.string().min(10, 'Idempotent clientUuid is required for offline sync deduplication'),
  orderId: z.string().min(1, 'Order ID is required'),
  stage: z.string().min(2, 'Production stage is required'),
  quantityProduced: z.number().int().nonnegative('Quantity produced must be non-negative'),
  rejectedQuantity: z.number().int().nonnegative().optional().default(0),
  photoUrl: z.string().nullable().optional(),
  originalTamilNote: z.string().nullable().optional(),
});

// Warning Confirmation / Override Validation
const WarningConfirmSchema = z.object({
  overrideCategory: z.string().min(2).optional(),
  comments: z.string().optional(),
  confirmed: z.boolean().default(true),
});

/**
 * Higher-order middleware function that validates req.body against a Zod schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error: Invalid input data',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ success: false, error: 'Malformed request body' });
    }
  };
}

module.exports = {
  LoginSchema,
  OrderCreateSchema,
  MilestoneDateChangeSchema,
  StageUpdateSchema,
  WarningConfirmSchema,
  validateBody,
};
