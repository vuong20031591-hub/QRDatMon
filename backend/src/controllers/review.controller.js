/**
 * Review Controller
 * Handles review-related HTTP requests
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

const reviewService = require('../services/review.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Create a new review
 * POST /api/reviews
 * Private
 */
const createReview = asyncHandler(async (req, res) => {
  const {
    orderId,
    billId,
    foodRating,
    serviceRating,
    ambianceRating,
    comment,
    isAnonymous,
    itemReviews
  } = req.body;

  const userId = req.user._id;

  const review = await reviewService.createReview({
    orderId,
    billId,
    foodRating,
    serviceRating,
    ambianceRating,
    comment,
    isAnonymous,
    itemReviews
  }, userId);

  return created(res, { review }, 'Review created successfully');
});

/**
 * Get review by ID
 * GET /api/reviews/:id
 * Public
 */
const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await reviewService.getReviewById(id);

  return ok(res, { review }, 'Review retrieved successfully');
});

/**
 * Get all reviews with filters
 * GET /api/reviews
 * Public
 */
const getReviews = asyncHandler(async (req, res) => {
  const { minRating, maxRating, menuItemId, startDate, endDate, page, limit, sortBy, sortOrder } = req.query;

  const filters = {
    minRating: minRating ? parseFloat(minRating) : undefined,
    maxRating: maxRating ? parseFloat(maxRating) : undefined,
    menuItemId,
    startDate,
    endDate
  };

  const pagination = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy,
    sortOrder
  };

  const result = await reviewService.getReviews(filters, pagination);

  return paginated(
    res,
    result.reviews,
    result.pagination,
    'Reviews retrieved successfully'
  );
});

/**
 * Get reviews for a menu item
 * GET /api/reviews/item/:menuItemId
 * Public
 */
const getItemReviews = asyncHandler(async (req, res) => {
  const { menuItemId } = req.params;
  const { page, limit } = req.query;

  const result = await reviewService.getItemReviews(menuItemId, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20
  });

  return ok(res, result, 'Item reviews retrieved successfully');
});

/**
 * Get review statistics
 * GET /api/reviews/stats
 * Public
 */
const getReviewStats = asyncHandler(async (req, res) => {
  const { menuItemId, startDate, endDate } = req.query;

  const stats = await reviewService.getReviewStats({
    menuItemId,
    startDate,
    endDate
  });

  return ok(res, { stats }, 'Review statistics retrieved successfully');
});

/**
 * Get current user's reviews
 * GET /api/reviews/my-reviews
 * Private
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = req.query;

  const result = await reviewService.getUserReviews(userId, {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20
  });

  return paginated(
    res,
    result.reviews,
    result.pagination,
    'Your reviews retrieved successfully'
  );
});

/**
 * Delete a review (admin only)
 * DELETE /api/reviews/:id
 * Admin only
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await reviewService.deleteReview(id);

  return ok(res, null, 'Review deleted successfully');
});

module.exports = {
  createReview,
  getReviewById,
  getReviews,
  getItemReviews,
  getReviewStats,
  getMyReviews,
  deleteReview
};
