/**
 * Request Validation Middleware using Joi
 * Provides reusable validation middleware and common schemas
 * Requirements: 11.2
 */

const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Validate request data against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
      errors: {
        wrap: {
          label: '' // Remove quotes around field names in error messages
        }
      }
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace request property with validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Validate multiple request properties at once
 * @param {Object} schemas - Object containing schemas for different properties
 * @returns {Function} Express middleware function
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const [property, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        errors: {
          wrap: { label: '' }
        }
      });

      if (error) {
        error.details.forEach(detail => {
          allErrors.push({
            field: `${property}.${detail.path.join('.')}`,
            message: detail.message,
            type: detail.type
          });
        });
      } else {
        req[property] = value;
      }
    }

    if (allErrors.length > 0) {
      return next(new ValidationError('Validation failed', allErrors));
    }

    next();
  };
};

// ============================================
// Common Joi Schema Definitions
// ============================================

/**
 * Common field schemas
 */
const commonSchemas = {
  // MongoDB ObjectId
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('{{#label}} must be a valid ID'),

  // Email
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(255),

  // Phone number (Vietnamese format)
  phone: Joi.string()
    .pattern(/^(0|\+84)[3-9][0-9]{8}$/)
    .message('{{#label}} must be a valid Vietnamese phone number'),

  // Password (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('{{#label}} must contain at least 1 uppercase, 1 lowercase, and 1 number'),

  // Pagination
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),

  // Date
  date: Joi.date().iso(),

  // Price (in VND, no decimals)
  price: Joi.number().integer().min(0),

  // Quantity
  quantity: Joi.number().integer().min(1).max(999),

  // Rating (1-5 stars)
  rating: Joi.number().integer().min(1).max(5),

  // Sort order
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),

  // Non-empty string
  nonEmptyString: Joi.string().trim().min(1),

  // URL
  url: Joi.string().uri()
};

// ============================================
// Authentication Schemas
// ============================================

const authSchemas = {
  // Google login
  googleLogin: Joi.object({
    idToken: Joi.string().required().messages({
      'any.required': 'Firebase ID token is required',
      'string.empty': 'Firebase ID token cannot be empty'
    })
  }),

  // Guest login
  guestLogin: Joi.object({
    deviceId: Joi.string().trim().max(255),
    name: Joi.string().trim().max(100)
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required'
    })
  }),

  // Send OTP - Requirements: 1.4
  sendOtp: Joi.object({
    phone: Joi.string()
      .pattern(/^(0|\+84)[3-9][0-9]{8}$/)
      .required()
      .messages({
        'any.required': 'Số điện thoại là bắt buộc',
        'string.empty': 'Số điện thoại không được để trống',
        'string.pattern.base': 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 0)'
      })
  }),

  // Verify OTP - Requirements: 2.1
  verifyOtp: Joi.object({
    phone: Joi.string()
      .pattern(/^(0|\+84)[3-9][0-9]{8}$/)
      .required()
      .messages({
        'any.required': 'Số điện thoại là bắt buộc',
        'string.empty': 'Số điện thoại không được để trống',
        'string.pattern.base': 'Số điện thoại không hợp lệ'
      }),
    otp: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        'any.required': 'Mã OTP là bắt buộc',
        'string.empty': 'Mã OTP không được để trống',
        'string.pattern.base': 'Mã OTP phải là 6 chữ số'
      })
  }),

  // Resend OTP - Requirements: 3.1, 3.2, 3.3
  resendOtp: Joi.object({
    phone: Joi.string()
      .pattern(/^(0|\+84)[3-9][0-9]{8}$/)
      .required()
      .messages({
        'any.required': 'Số điện thoại là bắt buộc',
        'string.empty': 'Số điện thoại không được để trống',
        'string.pattern.base': 'Số điện thoại không hợp lệ'
      })
  })
};

// ============================================
// Menu Schemas
// ============================================

const menuSchemas = {
  // Query menu items
  queryMenu: Joi.object({
    category: commonSchemas.objectId,
    status: Joi.string().valid('available', 'out_of_stock', 'suspended'),
    minPrice: commonSchemas.price,
    maxPrice: commonSchemas.price,
    isPopular: Joi.string().valid('true', 'false'),
    isNew: Joi.string().valid('true', 'false'),
    search: Joi.string().trim().max(100),
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    sortBy: Joi.string().valid('name', 'price', 'createdAt', 'sortOrder', 'popularity'),
    sortOrder: commonSchemas.sortOrder
  }),

  // Create menu item
  createMenuItem: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(1000).allow(''),
    category: commonSchemas.objectId.required(),
    price: commonSchemas.price.required(),
    costPrice: commonSchemas.price.default(0),
    unit: Joi.string().trim().max(50).default('phần'),
    imageUrl: Joi.string().trim().max(500).allow(''),
    images: Joi.array().items(Joi.string().trim().max(500)).max(10),
    status: Joi.string().valid('available', 'out_of_stock', 'suspended').default('available'),
    isPopular: Joi.boolean().default(false),
    isNew: Joi.boolean().default(false),
    preparationTime: Joi.number().integer().min(1).max(180).default(15),
    sortOrder: Joi.number().integer().min(0).default(0),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
    toppingGroups: Joi.array().items(commonSchemas.objectId)
  }),

  // Update menu item
  updateMenuItem: Joi.object({
    name: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(1000).allow(''),
    category: commonSchemas.objectId,
    price: commonSchemas.price,
    costPrice: commonSchemas.price,
    unit: Joi.string().trim().max(50),
    imageUrl: Joi.string().trim().max(500).allow(''),
    images: Joi.array().items(Joi.string().trim().max(500)).max(10),
    status: Joi.string().valid('available', 'out_of_stock', 'suspended'),
    isPopular: Joi.boolean(),
    isNew: Joi.boolean(),
    preparationTime: Joi.number().integer().min(1).max(180),
    sortOrder: Joi.number().integer().min(0),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
    toppingGroups: Joi.array().items(commonSchemas.objectId)
  })
};

// ============================================
// Cart Schemas
// ============================================

const cartSchemas = {
  // Add item to cart
  // Supports both old format (menuItem) and mobile format (menuItemId)
  addToCart: Joi.object({
    menuItem: commonSchemas.objectId,
    menuItemId: commonSchemas.objectId, // Mobile app compatibility
    combo: commonSchemas.objectId,
    tableId: Joi.string().allow('', null), // Mobile app sends this, allow any string
    quantity: commonSchemas.quantity.required(),
    note: Joi.string().trim().max(500).allow('', null),
    toppings: Joi.array().items(
      Joi.object({
        toppingGroupId: commonSchemas.objectId.allow(null), // Optional for mobile compatibility
        toppingId: commonSchemas.objectId.required(),
        quantity: Joi.number().integer().min(1).max(10).default(1)
      })
    ).default([])
  }).or('menuItem', 'menuItemId', 'combo').messages({
    'object.missing': 'Either menuItem, menuItemId, or combo must be provided'
  }),

  // Update cart item
  updateCartItem: Joi.object({
    quantity: commonSchemas.quantity,
    note: Joi.string().trim().max(500).allow(''),
    toppings: Joi.array().items(
      Joi.object({
        toppingGroupId: commonSchemas.objectId.required(),
        toppingId: commonSchemas.objectId.required(),
        quantity: Joi.number().integer().min(1).max(10).default(1)
      })
    )
  })
};

// ============================================
// Order Schemas
// ============================================

const orderSchemas = {
  // Create order
  createOrder: Joi.object({
    note: Joi.string().trim().max(500)
  }),

  // Update order status
  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid('confirmed', 'preparing', 'ready', 'served', 'cancelled')
      .required(),
    reason: Joi.string().trim().max(500).when('status', {
      is: 'cancelled',
      then: Joi.required().messages({
        'any.required': 'Cancellation reason is required'
      })
    })
  }),

  // Update order item status
  updateOrderItemStatus: Joi.object({
    status: Joi.string()
      .valid('preparing', 'ready', 'served', 'cancelled')
      .required(),
    reason: Joi.string().trim().max(500)
  }),

  // Query orders
  queryOrders: Joi.object({
    bill: commonSchemas.objectId,
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'),
    startDate: commonSchemas.date,
    endDate: commonSchemas.date,
    page: commonSchemas.page,
    limit: commonSchemas.limit
  })
};

// ============================================
// Bill Schemas
// ============================================

const billSchemas = {
  // Apply voucher
  applyVoucher: Joi.object({
    voucherCode: Joi.string().trim().uppercase().required().messages({
      'any.required': 'Voucher code is required'
    })
  }),

  // Split bill
  splitBill: Joi.object({
    items: Joi.array().items(
      Joi.object({
        orderItemId: commonSchemas.objectId.required(),
        quantity: commonSchemas.quantity.required()
      })
    ).min(1).required()
  })
};

// ============================================
// Payment Schemas
// ============================================

const paymentSchemas = {
  // Generate VietQR
  generateVietQR: Joi.object({
    billId: commonSchemas.objectId.required()
  }),

  // Confirm payment
  confirmPayment: Joi.object({
    billId: commonSchemas.objectId.required(),
    method: Joi.string().valid('cash', 'vietqr', 'card', 'momo', 'zalopay').required(),
    amount: commonSchemas.price.required(),
    transactionId: Joi.string().trim().max(255)
  })
};

// ============================================
// Table Schemas
// ============================================

const tableSchemas = {
  // Join table by QR token (legacy - kept for backward compatibility)
  joinTable: Joi.object({
    qrToken: Joi.string().required().messages({
      'any.required': 'QR token is required'
    })
  }),

  // Join table by QR token with confirmation support
  // Requirements: 6.1, 6.5
  joinByQR: Joi.object({
    qrToken: Joi.string()
      .length(32)
      .pattern(/^[0-9a-f]{32}$/)
      .required()
      .messages({
        'any.required': 'QR token is required',
        'string.empty': 'QR token cannot be empty',
        'string.length': 'QR token must be exactly 32 characters',
        'string.pattern.base': 'QR token must be a valid hexadecimal string'
      }),
    confirmed: Joi.boolean().default(false).messages({
      'boolean.base': 'Confirmed must be a boolean value'
    })
  }),

  // Verify QR token (for params validation)
  // Requirements: 6.1, 6.5
  verifyQR: Joi.object({
    qrToken: Joi.string()
      .length(32)
      .pattern(/^[0-9a-f]{32}$/)
      .required()
      .messages({
        'any.required': 'QR token is required',
        'string.empty': 'QR token cannot be empty',
        'string.length': 'QR token must be exactly 32 characters',
        'string.pattern.base': 'QR token must be a valid hexadecimal string'
      })
  }),

  // Update table status
  updateTableStatus: Joi.object({
    status: Joi.string()
      .valid('available', 'occupied', 'reserved', 'cleaning', 'inactive')
      .required()
  }),

  // Create/Update table
  createTable: Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
    area: commonSchemas.objectId.required(),
    capacity: Joi.number().integer().min(1).max(100).required(),
    status: Joi.string().valid('available', 'inactive').default('available')
  })
};

// ============================================
// Review Schemas
// ============================================

const reviewSchemas = {
  // Submit review
  submitReview: Joi.object({
    order: commonSchemas.objectId.required(),
    foodRating: commonSchemas.rating.required(),
    serviceRating: commonSchemas.rating.required(),
    ambianceRating: commonSchemas.rating,
    comment: Joi.string().trim().max(1000),
    itemReviews: Joi.array().items(
      Joi.object({
        menuItem: commonSchemas.objectId.required(),
        rating: commonSchemas.rating.required(),
        comment: Joi.string().trim().max(500)
      })
    )
  })
};

// ============================================
// Staff Schemas
// ============================================

const staffSchemas = {
  // Create staff
  createStaff: Joi.object({
    email: commonSchemas.email.required(),
    name: Joi.string().trim().min(1).max(100).required(),
    phone: commonSchemas.phone,
    role: Joi.string().valid('waiter', 'cashier', 'kitchen', 'manager', 'admin').required(),
    employeeCode: Joi.string().trim().uppercase().max(20)
  }),

  // Update staff
  updateStaff: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    phone: commonSchemas.phone,
    role: Joi.string().valid('waiter', 'cashier', 'kitchen', 'manager', 'admin'),
    isActive: Joi.boolean()
  })
};

// ============================================
// Common Parameter Schemas
// ============================================

const paramSchemas = {
  // ID parameter
  idParam: Joi.object({
    id: commonSchemas.objectId.required()
  }),

  // Table ID parameter
  tableIdParam: Joi.object({
    tableId: commonSchemas.objectId.required()
  }),

  // Item ID parameter
  itemIdParam: Joi.object({
    itemId: commonSchemas.objectId.required()
  })
};

// ============================================
// Pagination Query Schema
// ============================================

const paginationSchema = Joi.object({
  page: commonSchemas.page,
  limit: commonSchemas.limit,
  sortBy: Joi.string().trim(),
  sortOrder: commonSchemas.sortOrder
});

module.exports = {
  // Middleware functions
  validate,
  validateMultiple,

  // Common schemas
  commonSchemas,

  // Feature-specific schemas
  authSchemas,
  menuSchemas,
  cartSchemas,
  orderSchemas,
  billSchemas,
  paymentSchemas,
  tableSchemas,
  reviewSchemas,
  staffSchemas,
  paramSchemas,
  paginationSchema,

  // Re-export Joi for custom schemas
  Joi
};
