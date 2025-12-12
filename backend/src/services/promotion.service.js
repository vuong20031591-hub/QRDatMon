/**
 * Promotion Service
 * Handles voucher/promotion management, validation, and reporting
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9
 */

const { Promotion, PromotionUsage, Bill, User } = require('../models');
const {
  NotFoundError,
  ValidationError,
  ConflictError
} = require('../utils/errors');
const { PAGINATION } = require('../utils/constants');

/**
 * Get all active promotions
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Active promotions
 */
const getActivePromotions = async (options = {}) => {
  const { includeExpired = false, page = 1, limit = 20 } = options;

  const now = new Date();

  const query = {
    isActive: true
  };

  if (!includeExpired) {
    query.startDate = { $lte: now };
    query.endDate = { $gte: now };
  }

  // Check usage limits - exclude fully used promotions
  const skip = (page - 1) * limit;

  const [promotions, total] = await Promise.all([
    Promotion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Promotion.countDocuments(query)
  ]);

  // Filter out promotions that have reached usage limit
  const activePromotions = promotions.filter(p =>
    p.usageLimit === null || p.usedCount < p.usageLimit
  );

  return {
    promotions: activePromotions.map(formatPromotion),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get all promotions (admin)
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated promotions
 */
const getPromotions = async (filters = {}, pagination = {}) => {
  const { isActive, discountType, search } = filters;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = pagination;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (discountType) {
    query.discountType = discountType;
  }

  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [promotions, total] = await Promise.all([
    Promotion.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Promotion.countDocuments(query)
  ]);

  return {
    promotions: promotions.map(formatPromotion),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get promotion by ID
 * @param {string} promotionId - Promotion ID
 * @returns {Promise<Object>} Promotion details
 */
const getPromotionById = async (promotionId) => {
  const promotion = await Promotion.findById(promotionId).lean();

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  return formatPromotion(promotion);
};

/**
 * Get promotion by code
 * @param {string} code - Voucher code
 * @returns {Promise<Object>} Promotion details
 */
const getPromotionByCode = async (code) => {
  const promotion = await Promotion.findOne({
    code: code.toUpperCase()
  }).lean();

  if (!promotion) {
    throw new NotFoundError('Voucher code not found');
  }

  return formatPromotion(promotion);
};

/**
 * Validate voucher code
 * @param {string} code - Voucher code
 * @param {string} userId - User ID
 * @param {number} orderAmount - Order subtotal amount
 * @returns {Promise<Object>} Validation result with discount calculation
 */
const validateVoucherCode = async (code, userId, orderAmount = 0) => {
  const promotion = await Promotion.findOne({
    code: code.toUpperCase()
  });

  if (!promotion) {
    return {
      valid: false,
      error: 'INVALID_CODE',
      message: 'Voucher code not found'
    };
  }

  const now = new Date();

  // Check if active
  if (!promotion.isActive) {
    return {
      valid: false,
      error: 'INACTIVE',
      message: 'This voucher is no longer active'
    };
  }

  // Check date range
  if (now < promotion.startDate) {
    return {
      valid: false,
      error: 'NOT_STARTED',
      message: `This voucher is valid from ${promotion.startDate.toLocaleDateString()}`
    };
  }

  if (now > promotion.endDate) {
    return {
      valid: false,
      error: 'EXPIRED',
      message: `This voucher expired on ${promotion.endDate.toLocaleDateString()}`
    };
  }

  // Check usage limit
  if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) {
    return {
      valid: false,
      error: 'USAGE_LIMIT_REACHED',
      message: 'This voucher has reached its maximum usage limit'
    };
  }

  // Check per-user usage
  if (userId && promotion.usagePerUser !== null) {
    const userUsageCount = await PromotionUsage.countDocuments({
      promotion: promotion._id,
      user: userId
    });

    if (userUsageCount >= promotion.usagePerUser) {
      return {
        valid: false,
        error: 'USER_LIMIT_REACHED',
        message: `You have already used this voucher ${promotion.usagePerUser} time(s)`
      };
    }
  }

  // Check minimum order amount
  if (orderAmount > 0 && orderAmount < promotion.minOrderAmount) {
    return {
      valid: false,
      error: 'MINIMUM_NOT_MET',
      message: `Minimum order amount is ${promotion.minOrderAmount.toLocaleString()} VND`
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (orderAmount > 0) {
    if (promotion.discountType === 'percent') {
      discountAmount = Math.round(orderAmount * (promotion.discountValue / 100));
    } else {
      discountAmount = promotion.discountValue;
    }

    // Apply max discount cap
    if (promotion.maxDiscount !== null && discountAmount > promotion.maxDiscount) {
      discountAmount = promotion.maxDiscount;
    }

    // Cannot discount more than order amount
    discountAmount = Math.min(discountAmount, orderAmount);
  }

  return {
    valid: true,
    promotion: formatPromotion(promotion),
    calculation: orderAmount > 0 ? {
      orderAmount,
      discountAmount,
      finalAmount: orderAmount - discountAmount,
      discountPercent: orderAmount > 0 ? Math.round((discountAmount / orderAmount) * 100) : 0
    } : null
  };
};

/**
 * Create a new promotion
 * @param {Object} data - Promotion data
 * @returns {Promise<Object>} Created promotion
 */
const createPromotion = async (data) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    usagePerUser
  } = data;

  // Check for duplicate code
  const existingPromotion = await Promotion.findOne({
    code: code.toUpperCase()
  });

  if (existingPromotion) {
    throw new ConflictError(`Voucher code "${code}" already exists`);
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    throw new ValidationError('End date must be after start date');
  }

  // Validate discount value for percentage
  if (discountType === 'percent' && discountValue > 100) {
    throw new ValidationError('Percentage discount cannot exceed 100%');
  }

  const promotion = await Promotion.create({
    code: code.toUpperCase(),
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount: maxDiscount || null,
    startDate: start,
    endDate: end,
    usageLimit: usageLimit || null,
    usagePerUser: usagePerUser || 1,
    usedCount: 0,
    isActive: true
  });

  return formatPromotion(promotion.toObject());
};

/**
 * Update a promotion
 * @param {string} promotionId - Promotion ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated promotion
 */
const updatePromotion = async (promotionId, data) => {
  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  const {
    name,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    usagePerUser,
    isActive
  } = data;

  // If changing code, check for duplicates
  if (data.code && data.code.toUpperCase() !== promotion.code) {
    const existingPromotion = await Promotion.findOne({
      code: data.code.toUpperCase(),
      _id: { $ne: promotionId }
    });

    if (existingPromotion) {
      throw new ConflictError(`Voucher code "${data.code}" already exists`);
    }

    promotion.code = data.code.toUpperCase();
  }

  // Update fields
  if (name !== undefined) promotion.name = name;
  if (description !== undefined) promotion.description = description;
  if (discountType !== undefined) promotion.discountType = discountType;
  if (discountValue !== undefined) {
    if (promotion.discountType === 'percent' && discountValue > 100) {
      throw new ValidationError('Percentage discount cannot exceed 100%');
    }
    promotion.discountValue = discountValue;
  }
  if (minOrderAmount !== undefined) promotion.minOrderAmount = minOrderAmount;
  if (maxDiscount !== undefined) promotion.maxDiscount = maxDiscount;

  if (startDate !== undefined) promotion.startDate = new Date(startDate);
  if (endDate !== undefined) promotion.endDate = new Date(endDate);

  // Validate dates
  if (promotion.endDate <= promotion.startDate) {
    throw new ValidationError('End date must be after start date');
  }

  if (usageLimit !== undefined) promotion.usageLimit = usageLimit;
  if (usagePerUser !== undefined) promotion.usagePerUser = usagePerUser;
  if (isActive !== undefined) promotion.isActive = isActive;

  await promotion.save();

  return formatPromotion(promotion.toObject());
};

/**
 * Deactivate a promotion
 * @param {string} promotionId - Promotion ID
 * @returns {Promise<Object>} Deactivated promotion
 */
const deactivatePromotion = async (promotionId) => {
  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  promotion.isActive = false;
  await promotion.save();

  return formatPromotion(promotion.toObject());
};

/**
 * Reactivate a promotion
 * @param {string} promotionId - Promotion ID
 * @returns {Promise<Object>} Reactivated promotion
 */
const reactivatePromotion = async (promotionId) => {
  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  // Check if promotion can be reactivated
  const now = new Date();
  if (now > promotion.endDate) {
    throw new ValidationError('Cannot reactivate an expired promotion');
  }

  if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) {
    throw new ValidationError('Cannot reactivate - usage limit already reached');
  }

  promotion.isActive = true;
  await promotion.save();

  return formatPromotion(promotion.toObject());
};

/**
 * Get promotion usage report
 * @param {string} promotionId - Promotion ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Usage report
 */
const getPromotionUsageReport = async (promotionId, options = {}) => {
  const { page = 1, limit = 20, startDate, endDate } = options;

  const promotion = await Promotion.findById(promotionId);

  if (!promotion) {
    throw new NotFoundError('Promotion not found');
  }

  const query = { promotion: promotionId };

  if (startDate || endDate) {
    query.usedAt = {};
    if (startDate) query.usedAt.$gte = new Date(startDate);
    if (endDate) query.usedAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [usages, total, stats] = await Promise.all([
    PromotionUsage.find(query)
      .populate('user', 'name email')
      .populate('bill', 'billNumber totalAmount')
      .sort({ usedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PromotionUsage.countDocuments(query),
    PromotionUsage.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUsages: { $sum: 1 },
          totalDiscountGiven: { $sum: '$discountAmount' },
          averageDiscount: { $avg: '$discountAmount' },
          uniqueUsers: { $addToSet: '$user' }
        }
      }
    ])
  ]);

  const aggregatedStats = stats[0] || {
    totalUsages: 0,
    totalDiscountGiven: 0,
    averageDiscount: 0,
    uniqueUsers: []
  };

  return {
    promotion: formatPromotion(promotion.toObject()),
    statistics: {
      totalUsages: aggregatedStats.totalUsages,
      totalDiscountGiven: Math.round(aggregatedStats.totalDiscountGiven),
      averageDiscount: Math.round(aggregatedStats.averageDiscount || 0),
      uniqueUsersCount: aggregatedStats.uniqueUsers.length,
      usageRate: promotion.usageLimit
        ? Math.round((promotion.usedCount / promotion.usageLimit) * 100)
        : null,
      remainingUsages: promotion.usageLimit
        ? Math.max(0, promotion.usageLimit - promotion.usedCount)
        : 'Unlimited'
    },
    usages: usages.map(usage => ({
      id: usage._id,
      user: usage.user ? {
        id: usage.user._id,
        name: usage.user.name,
        email: usage.user.email
      } : null,
      bill: usage.bill ? {
        id: usage.bill._id,
        billNumber: usage.bill.billNumber,
        totalAmount: usage.bill.totalAmount
      } : null,
      discountAmount: usage.discountAmount,
      usedAt: usage.usedAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Check and deactivate expired promotions
 * @returns {Promise<Object>} Result with count of deactivated promotions
 */
const checkAndDeactivateExpired = async () => {
  const now = new Date();

  // Find and deactivate expired promotions
  const result = await Promotion.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    {
      isActive: false
    }
  );

  // Find and deactivate promotions that reached usage limit
  const usageLimitResult = await Promotion.updateMany(
    {
      isActive: true,
      usageLimit: { $ne: null },
      $expr: { $gte: ['$usedCount', '$usageLimit'] }
    },
    {
      isActive: false
    }
  );

  return {
    expiredCount: result.modifiedCount,
    usageLimitReachedCount: usageLimitResult.modifiedCount,
    totalDeactivated: result.modifiedCount + usageLimitResult.modifiedCount
  };
};

/**
 * Generate unique voucher code
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated code
 */
const generateVoucherCode = async (options = {}) => {
  const { prefix = 'QRD', length = 8 } = options;

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    const randomPart = Array.from(
      { length: length - prefix.length },
      () => characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');

    code = `${prefix}${randomPart}`;
    attempts++;

    // Check if code exists
    const existing = await Promotion.findOne({ code });
    if (!existing) break;

  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique voucher code');
  }

  return code;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format promotion for API response
 */
const formatPromotion = (promotion) => {
  const now = new Date();

  return {
    id: promotion._id,
    code: promotion.code,
    name: promotion.name,
    description: promotion.description || null,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    discountDisplay: promotion.discountType === 'percent'
      ? `${promotion.discountValue}%`
      : `${promotion.discountValue.toLocaleString()} VND`,
    minOrderAmount: promotion.minOrderAmount,
    maxDiscount: promotion.maxDiscount,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    usageLimit: promotion.usageLimit,
    usagePerUser: promotion.usagePerUser,
    usedCount: promotion.usedCount,
    remainingUsages: promotion.usageLimit !== null
      ? Math.max(0, promotion.usageLimit - promotion.usedCount)
      : null,
    isActive: promotion.isActive,
    status: getPromotionStatus(promotion, now),
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt
  };
};

/**
 * Get promotion status
 */
const getPromotionStatus = (promotion, now = new Date()) => {
  if (!promotion.isActive) return 'inactive';
  if (now < promotion.startDate) return 'scheduled';
  if (now > promotion.endDate) return 'expired';
  if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) return 'exhausted';
  return 'active';
};

module.exports = {
  getActivePromotions,
  getPromotions,
  getPromotionById,
  getPromotionByCode,
  validateVoucherCode,
  createPromotion,
  updatePromotion,
  deactivatePromotion,
  reactivatePromotion,
  getPromotionUsageReport,
  checkAndDeactivateExpired,
  generateVoucherCode,
  formatPromotion
};
