/**
 * Review Service
 * Handles review creation, retrieval, and statistics
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

const { Review, MenuItem, Order, Bill, User } = require('../models');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { PAGINATION } = require('../utils/constants');

/**
 * Create a new review
 * @param {Object} data - Review data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created review
 */
const createReview = async (data, userId) => {
  const {
    orderId,
    billId,
    foodRating,
    serviceRating,
    ambianceRating,
    comment,
    isAnonymous,
    itemReviews
  } = data;

  // Validate ratings (1-5)
  if (foodRating < 1 || foodRating > 5) {
    throw new ValidationError('Food rating must be between 1 and 5');
  }
  if (serviceRating < 1 || serviceRating > 5) {
    throw new ValidationError('Service rating must be between 1 and 5');
  }
  if (ambianceRating < 1 || ambianceRating > 5) {
    throw new ValidationError('Ambiance rating must be between 1 and 5');
  }

  // Validate order if provided
  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    // Check if user owns this order
    if (order.user.toString() !== userId) {
      throw new ForbiddenError('You can only review your own orders');
    }
    // Check if already reviewed
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      throw new ValidationError('This order has already been reviewed');
    }
  }

  // Validate bill if provided
  if (billId) {
    const bill = await Bill.findById(billId);
    if (!bill) {
      throw new NotFoundError('Bill not found');
    }
  }

  // Validate item reviews
  if (itemReviews && itemReviews.length > 0) {
    for (const itemReview of itemReviews) {
      if (itemReview.rating < 1 || itemReview.rating > 5) {
        throw new ValidationError('Item rating must be between 1 and 5');
      }
      const menuItem = await MenuItem.findById(itemReview.menuItem);
      if (!menuItem) {
        throw new NotFoundError(`Menu item ${itemReview.menuItem} not found`);
      }
    }
  }

  const review = await Review.create({
    user: userId,
    order: orderId || undefined,
    bill: billId || undefined,
    foodRating,
    serviceRating,
    ambianceRating,
    comment: comment || undefined,
    isAnonymous: isAnonymous || false,
    itemReviews: itemReviews || []
  });

  return getReviewById(review._id);
};

/**
 * Get review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Review details
 */
const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate('user', 'name avatarUrl')
    .populate('order', 'orderNumber')
    .populate('bill', 'billNumber')
    .populate('itemReviews.menuItem', 'name imageUrl')
    .lean();

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  return formatReview(review);
};

/**
 * Get reviews with filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated reviews
 */
const getReviews = async (filters = {}, pagination = {}) => {
  const { minRating, maxRating, menuItemId, startDate, endDate } = filters;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = pagination;

  const query = {};

  if (minRating !== undefined) {
    query.averageRating = { $gte: minRating };
  }
  if (maxRating !== undefined) {
    query.averageRating = { ...query.averageRating, $lte: maxRating };
  }

  if (menuItemId) {
    query['itemReviews.menuItem'] = menuItemId;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name avatarUrl')
      .populate('order', 'orderNumber')
      .populate('itemReviews.menuItem', 'name imageUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(query)
  ]);

  return {
    reviews: reviews.map(formatReview),
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
 * Get reviews for a specific menu item
 * @param {string} menuItemId - Menu item ID
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated item reviews
 */
const getItemReviews = async (menuItemId, pagination = {}) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = pagination;

  // Check if menu item exists
  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    throw new NotFoundError('Menu item not found');
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ 'itemReviews.menuItem': menuItemId })
      .populate('user', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ 'itemReviews.menuItem': menuItemId })
  ]);

  // Extract item-specific reviews
  const itemReviews = reviews.map(review => {
    const itemReview = review.itemReviews.find(
      ir => ir.menuItem.toString() === menuItemId
    );
    return {
      id: review._id,
      user: review.isAnonymous ? null : {
        id: review.user?._id,
        name: review.user?.name,
        avatarUrl: review.user?.avatarUrl
      },
      rating: itemReview?.rating,
      comment: itemReview?.comment,
      isAnonymous: review.isAnonymous,
      createdAt: review.createdAt
    };
  });

  return {
    menuItem: {
      id: menuItem._id,
      name: menuItem.name,
      imageUrl: menuItem.imageUrl
    },
    reviews: itemReviews,
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
 * Get review statistics
 * @param {Object} options - Options
 * @returns {Promise<Object>} Review statistics
 */
const getReviewStats = async (options = {}) => {
  const { menuItemId, startDate, endDate } = options;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Overall stats
  const overallStats = await Review.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        avgFoodRating: { $avg: '$foodRating' },
        avgServiceRating: { $avg: '$serviceRating' },
        avgAmbianceRating: { $avg: '$ambianceRating' },
        avgOverallRating: { $avg: '$averageRating' }
      }
    }
  ]);

  // Rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $round: ['$averageRating', 0] },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Format distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(item => {
    if (item._id >= 1 && item._id <= 5) {
      distribution[item._id] = item.count;
    }
  });

  // Menu item specific stats if requested
  let itemStats = null;
  if (menuItemId) {
    const itemStatsResult = await Review.aggregate([
      { $match: { ...matchStage, 'itemReviews.menuItem': menuItemId } },
      { $unwind: '$itemReviews' },
      { $match: { 'itemReviews.menuItem': menuItemId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$itemReviews.rating' }
        }
      }
    ]);

    if (itemStatsResult.length > 0) {
      itemStats = {
        totalReviews: itemStatsResult[0].totalReviews,
        avgRating: Math.round(itemStatsResult[0].avgRating * 10) / 10
      };
    }
  }

  const stats = overallStats[0] || {
    totalReviews: 0,
    avgFoodRating: 0,
    avgServiceRating: 0,
    avgAmbianceRating: 0,
    avgOverallRating: 0
  };

  return {
    totalReviews: stats.totalReviews,
    averageRatings: {
      food: Math.round(stats.avgFoodRating * 10) / 10,
      service: Math.round(stats.avgServiceRating * 10) / 10,
      ambiance: Math.round(stats.avgAmbianceRating * 10) / 10,
      overall: Math.round(stats.avgOverallRating * 10) / 10
    },
    distribution,
    itemStats,
    generatedAt: new Date()
  };
};

/**
 * Get user's reviews
 * @param {string} userId - User ID
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} User's reviews
 */
const getUserReviews = async (userId, pagination = {}) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = pagination;

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId })
      .populate('order', 'orderNumber')
      .populate('itemReviews.menuItem', 'name imageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ user: userId })
  ]);

  return {
    reviews: reviews.map(formatReview),
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
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} data - Update data
 * @param {string} userId - User ID (for permission check)
 * @param {boolean} isAdmin - Is admin user
 * @returns {Promise<Object>} Updated review
 */
const updateReview = async (reviewId, data, userId, isAdmin = false) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Check permission: only owner or admin can update
  if (!isAdmin && review.user.toString() !== userId) {
    throw new ForbiddenError('You can only update your own reviews');
  }

  const { foodRating, serviceRating, ambianceRating, comment, isAnonymous, itemReviews } = data;

  // Validate ratings if provided
  if (foodRating !== undefined && (foodRating < 1 || foodRating > 5)) {
    throw new ValidationError('Food rating must be between 1 and 5');
  }
  if (serviceRating !== undefined && (serviceRating < 1 || serviceRating > 5)) {
    throw new ValidationError('Service rating must be between 1 and 5');
  }
  if (ambianceRating !== undefined && (ambianceRating < 1 || ambianceRating > 5)) {
    throw new ValidationError('Ambiance rating must be between 1 and 5');
  }

  // Update fields
  if (foodRating !== undefined) review.foodRating = foodRating;
  if (serviceRating !== undefined) review.serviceRating = serviceRating;
  if (ambianceRating !== undefined) review.ambianceRating = ambianceRating;
  if (comment !== undefined) review.comment = comment;
  if (isAnonymous !== undefined) review.isAnonymous = isAnonymous;

  // Update item reviews if provided
  if (itemReviews !== undefined) {
    for (const itemReview of itemReviews) {
      if (itemReview.rating < 1 || itemReview.rating > 5) {
        throw new ValidationError('Item rating must be between 1 and 5');
      }
      const menuItem = await MenuItem.findById(itemReview.menuItem);
      if (!menuItem) {
        throw new NotFoundError(`Menu item ${itemReview.menuItem} not found`);
      }
    }
    review.itemReviews = itemReviews;
  }

  await review.save();
  return getReviewById(reviewId);
};

/**
 * Delete a review (admin only)
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError('Review not found');
  }

  await Review.findByIdAndDelete(reviewId);
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format review for API response
 */
const formatReview = (review) => {
  return {
    id: review._id,
    user: review.isAnonymous ? null : {
      id: review.user?._id,
      name: review.user?.name,
      avatarUrl: review.user?.avatarUrl
    },
    order: review.order ? {
      id: review.order._id,
      orderNumber: review.order.orderNumber
    } : null,
    bill: review.bill ? {
      id: review.bill._id,
      billNumber: review.bill.billNumber
    } : null,
    ratings: {
      food: review.foodRating,
      service: review.serviceRating,
      ambiance: review.ambianceRating,
      average: review.averageRating
    },
    comment: review.comment || null,
    isAnonymous: review.isAnonymous,
    itemReviews: review.itemReviews?.map(ir => ({
      menuItem: ir.menuItem ? {
        id: ir.menuItem._id || ir.menuItem,
        name: ir.menuItem.name,
        imageUrl: ir.menuItem.imageUrl
      } : null,
      rating: ir.rating,
      comment: ir.comment || null
    })) || [],
    createdAt: review.createdAt
  };
};

module.exports = {
  createReview,
  getReviewById,
  getReviews,
  getItemReviews,
  getReviewStats,
  getUserReviews,
  updateReview,
  deleteReview,
  formatReview
};
