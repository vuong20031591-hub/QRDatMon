/**
 * Report Service
 * Handles revenue reports, popular items, operational metrics, and staff performance
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

const { Bill, Order, MenuItem, Staff, Shift, Review, Payment } = require('../models');
const { BILL_STATUS, ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');

/**
 * Get revenue report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Revenue report data
 */
const getRevenueReport = async (options = {}) => {
  const {
    startDate,
    endDate,
    groupBy = 'day', // day, week, month
    areaId,
    staffId
  } = options;

  const matchStage = {
    status: BILL_STATUS.PAID,
    closedAt: {}
  };

  if (startDate) matchStage.closedAt.$gte = new Date(startDate);
  if (endDate) matchStage.closedAt.$lte = new Date(endDate);
  if (!startDate && !endDate) {
    // Default to last 30 days
    matchStage.closedAt.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    matchStage.closedAt.$lte = new Date();
  }

  // Build aggregation pipeline
  const pipeline = [
    { $match: matchStage }
  ];

  // Join with tables if filtering by area
  if (areaId) {
    pipeline.push(
      { $lookup: { from: 'tables', localField: 'table', foreignField: '_id', as: 'tableInfo' } },
      { $unwind: '$tableInfo' },
      { $match: { 'tableInfo.area': areaId } }
    );
  }

  // Filter by cashier if staffId provided
  if (staffId) {
    pipeline.push({ $match: { cashier: staffId } });
  }

  // Group by date format
  const dateFormat = {
    day: { $dateToString: { format: '%Y-%m-%d', date: '$closedAt' } },
    week: { $dateToString: { format: '%Y-W%V', date: '$closedAt' } },
    month: { $dateToString: { format: '%Y-%m', date: '$closedAt' } }
  };

  pipeline.push(
    {
      $group: {
        _id: dateFormat[groupBy] || dateFormat.day,
        totalRevenue: { $sum: '$totalAmount' },
        subtotal: { $sum: '$subtotal' },
        discountTotal: { $sum: '$discountAmount' },
        serviceChargeTotal: { $sum: '$serviceChargeAmount' },
        vatTotal: { $sum: '$vatAmount' },
        billCount: { $sum: 1 },
        avgBillAmount: { $avg: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  );

  const revenueByPeriod = await Bill.aggregate(pipeline);

  // Calculate totals
  const totals = revenueByPeriod.reduce((acc, item) => ({
    totalRevenue: acc.totalRevenue + item.totalRevenue,
    subtotal: acc.subtotal + item.subtotal,
    discountTotal: acc.discountTotal + item.discountTotal,
    serviceChargeTotal: acc.serviceChargeTotal + item.serviceChargeTotal,
    vatTotal: acc.vatTotal + item.vatTotal,
    billCount: acc.billCount + item.billCount
  }), {
    totalRevenue: 0,
    subtotal: 0,
    discountTotal: 0,
    serviceChargeTotal: 0,
    vatTotal: 0,
    billCount: 0
  });

  totals.avgBillAmount = totals.billCount > 0 ? Math.round(totals.totalRevenue / totals.billCount) : 0;

  // Get payment method breakdown
  const paymentBreakdown = await Payment.aggregate([
    {
      $match: {
        status: PAYMENT_STATUS.COMPLETED,
        paidAt: matchStage.closedAt
      }
    },
    {
      $group: {
        _id: '$method',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    period: { startDate: matchStage.closedAt.$gte, endDate: matchStage.closedAt.$lte },
    groupBy,
    totals,
    revenueByPeriod: revenueByPeriod.map(item => ({
      period: item._id,
      revenue: item.totalRevenue,
      subtotal: item.subtotal,
      discount: item.discountTotal,
      serviceCharge: item.serviceChargeTotal,
      vat: item.vatTotal,
      billCount: item.billCount,
      avgBillAmount: Math.round(item.avgBillAmount)
    })),
    paymentBreakdown: paymentBreakdown.map(item => ({
      method: item._id,
      total: item.total,
      count: item.count,
      percentage: totals.totalRevenue > 0 ? Math.round((item.total / totals.totalRevenue) * 100) : 0
    }))
  };
};

/**
 * Get popular items report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Popular items data
 */
const getPopularItemsReport = async (options = {}) => {
  const {
    startDate,
    endDate,
    limit = 10,
    categoryId
  } = options;

  const matchStage = {
    status: { $nin: [ORDER_STATUS.CANCELLED] },
    createdAt: {}
  };

  if (startDate) matchStage.createdAt.$gte = new Date(startDate);
  if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  if (!startDate && !endDate) {
    matchStage.createdAt.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    matchStage.createdAt.$lte = new Date();
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.status': { $ne: 'cancelled' } } }
  ];

  // Filter by category if provided
  if (categoryId) {
    pipeline.push(
      { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'menuItemInfo' } },
      { $unwind: { path: '$menuItemInfo', preserveNullAndEmptyArrays: true } },
      { $match: { 'menuItemInfo.category': categoryId } }
    );
  }

  pipeline.push(
    {
      $group: {
        _id: '$items.menuItem',
        itemName: { $first: '$items.itemName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    { $unwind: { path: '$menuItem', preserveNullAndEmptyArrays: true } }
  );

  const popularItems = await Order.aggregate(pipeline);

  // Get least popular items
  const leastPopularPipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.status': { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$items.menuItem',
        itemName: { $first: '$items.itemName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' }
      }
    },
    { $sort: { totalQuantity: 1 } },
    { $limit: limit }
  ];

  const leastPopularItems = await Order.aggregate(leastPopularPipeline);

  return {
    period: { startDate: matchStage.createdAt.$gte, endDate: matchStage.createdAt.$lte },
    popularItems: popularItems.map((item, index) => ({
      rank: index + 1,
      id: item._id,
      name: item.itemName || item.menuItem?.name || 'Unknown',
      imageUrl: item.menuItem?.imageUrl || null,
      category: item.menuItem?.category || null,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount
    })),
    leastPopularItems: leastPopularItems.map((item, index) => ({
      rank: index + 1,
      id: item._id,
      name: item.itemName || 'Unknown',
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue
    }))
  };
};

/**
 * Get operational metrics
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Operational metrics
 */
const getOperationalMetrics = async (options = {}) => {
  const { startDate, endDate } = options;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  if (!startDate && !endDate) {
    dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    dateFilter.$lte = new Date();
  }

  // Order statistics
  const orderStats = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.SERVED] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.CANCELLED] }, 1, 0] }
        },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  // Average service time (from order creation to served)
  const serviceTimeStats = await Order.aggregate([
    {
      $match: {
        createdAt: dateFilter,
        status: ORDER_STATUS.SERVED
      }
    },
    { $unwind: '$items' },
    { $match: { 'items.servedAt': { $exists: true } } },
    {
      $project: {
        serviceTime: {
          $divide: [
            { $subtract: ['$items.servedAt', '$createdAt'] },
            60000 // Convert to minutes
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgServiceTime: { $avg: '$serviceTime' },
        minServiceTime: { $min: '$serviceTime' },
        maxServiceTime: { $max: '$serviceTime' }
      }
    }
  ]);

  // Preparation time (from order confirmed to ready)
  const prepTimeStats = await Order.aggregate([
    {
      $match: {
        createdAt: dateFilter,
        confirmedAt: { $exists: true }
      }
    },
    { $unwind: '$items' },
    { $match: { 'items.completedAt': { $exists: true } } },
    {
      $project: {
        prepTime: {
          $divide: [
            { $subtract: ['$items.completedAt', '$items.startedAt'] },
            60000
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgPrepTime: { $avg: '$prepTime' },
        minPrepTime: { $min: '$prepTime' },
        maxPrepTime: { $max: '$prepTime' }
      }
    }
  ]);

  // Orders by hour
  const ordersByHour = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Cancellation reasons
  const cancellationReasons = await Order.aggregate([
    {
      $match: {
        createdAt: dateFilter,
        status: ORDER_STATUS.CANCELLED
      }
    },
    {
      $group: {
        _id: '$cancelReason',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const stats = orderStats[0] || { totalOrders: 0, completedOrders: 0, cancelledOrders: 0, totalAmount: 0 };
  const serviceTime = serviceTimeStats[0] || { avgServiceTime: 0, minServiceTime: 0, maxServiceTime: 0 };
  const prepTime = prepTimeStats[0] || { avgPrepTime: 0, minPrepTime: 0, maxPrepTime: 0 };

  return {
    period: { startDate: dateFilter.$gte, endDate: dateFilter.$lte },
    orderStats: {
      total: stats.totalOrders,
      completed: stats.completedOrders,
      cancelled: stats.cancelledOrders,
      completionRate: stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0,
      cancellationRate: stats.totalOrders > 0 ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0,
      avgOrderValue: stats.totalOrders > 0 ? Math.round(stats.totalAmount / stats.totalOrders) : 0
    },
    serviceTime: {
      average: Math.round(serviceTime.avgServiceTime || 0),
      min: Math.round(serviceTime.minServiceTime || 0),
      max: Math.round(serviceTime.maxServiceTime || 0),
      unit: 'minutes'
    },
    preparationTime: {
      average: Math.round(prepTime.avgPrepTime || 0),
      min: Math.round(prepTime.minPrepTime || 0),
      max: Math.round(prepTime.maxPrepTime || 0),
      unit: 'minutes'
    },
    ordersByHour: ordersByHour.map(item => ({
      hour: item._id,
      count: item.count,
      revenue: item.revenue
    })),
    cancellationReasons: cancellationReasons.map(item => ({
      reason: item._id || 'Not specified',
      count: item.count
    }))
  };
};

/**
 * Get staff performance report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Staff performance data
 */
const getStaffPerformanceReport = async (options = {}) => {
  const { startDate, endDate, staffId } = options;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  if (!startDate && !endDate) {
    dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    dateFilter.$lte = new Date();
  }

  // Cashier performance (bills processed)
  const cashierMatch = { closedAt: dateFilter, status: BILL_STATUS.PAID };
  if (staffId) cashierMatch.cashier = staffId;

  const cashierPerformance = await Bill.aggregate([
    { $match: cashierMatch },
    {
      $group: {
        _id: '$cashier',
        billsProcessed: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgBillAmount: { $avg: '$totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'staff',
        localField: '_id',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'staffInfo.user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
    { $sort: { totalRevenue: -1 } }
  ]);

  // Server performance (orders served)
  const serverPerformance = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    { $match: { 'items.servedBy': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$items.servedBy',
        itemsServed: { $sum: '$items.quantity' },
        ordersServed: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        itemsServed: 1,
        ordersServed: { $size: '$ordersServed' }
      }
    },
    {
      $lookup: {
        from: 'staff',
        localField: '_id',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'staffInfo.user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
    { $sort: { itemsServed: -1 } }
  ]);

  // Shift statistics
  const shiftStats = await Shift.aggregate([
    { $match: { workDate: dateFilter } },
    {
      $group: {
        _id: '$staff',
        totalShifts: { $sum: 1 },
        totalHours: {
          $sum: {
            $cond: [
              { $and: ['$checkInAt', '$checkOutAt'] },
              { $divide: [{ $subtract: ['$checkOutAt', '$checkInAt'] }, 3600000] },
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'staff',
        localField: '_id',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: { path: '$staffInfo', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'staffInfo.user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
  ]);

  return {
    period: { startDate: dateFilter.$gte, endDate: dateFilter.$lte },
    cashierPerformance: cashierPerformance.map(item => ({
      staffId: item._id,
      name: item.userInfo?.name || 'Unknown',
      employeeCode: item.staffInfo?.employeeCode || null,
      role: item.staffInfo?.role || null,
      billsProcessed: item.billsProcessed,
      totalRevenue: item.totalRevenue,
      avgBillAmount: Math.round(item.avgBillAmount)
    })),
    serverPerformance: serverPerformance.map(item => ({
      staffId: item._id,
      name: item.userInfo?.name || 'Unknown',
      employeeCode: item.staffInfo?.employeeCode || null,
      itemsServed: item.itemsServed,
      ordersServed: item.ordersServed
    })),
    shiftStats: shiftStats.map(item => ({
      staffId: item._id,
      name: item.userInfo?.name || 'Unknown',
      employeeCode: item.staffInfo?.employeeCode || null,
      totalShifts: item.totalShifts,
      totalHours: Math.round(item.totalHours * 10) / 10
    }))
  };
};

/**
 * Get review statistics
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Review statistics
 */
const getReviewStats = async (options = {}) => {
  const { startDate, endDate } = options;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  if (!startDate && !endDate) {
    dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    dateFilter.$lte = new Date();
  }

  const reviewStats = await Review.aggregate([
    { $match: { createdAt: dateFilter } },
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

  const ratingDistribution = await Review.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: { $round: ['$averageRating', 0] },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const stats = reviewStats[0] || {
    totalReviews: 0,
    avgFoodRating: 0,
    avgServiceRating: 0,
    avgAmbianceRating: 0,
    avgOverallRating: 0
  };

  return {
    period: { startDate: dateFilter.$gte, endDate: dateFilter.$lte },
    summary: {
      totalReviews: stats.totalReviews,
      avgFoodRating: Math.round(stats.avgFoodRating * 10) / 10,
      avgServiceRating: Math.round(stats.avgServiceRating * 10) / 10,
      avgAmbianceRating: Math.round(stats.avgAmbianceRating * 10) / 10,
      avgOverallRating: Math.round(stats.avgOverallRating * 10) / 10
    },
    ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingDistribution.find(r => r._id === rating)?.count || 0
    }))
  };
};

/**
 * Get dashboard summary
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Dashboard summary
 */
const getDashboardSummary = async (options = {}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's stats
  const todayBills = await Bill.aggregate([
    { $match: { closedAt: { $gte: today, $lt: tomorrow }, status: BILL_STATUS.PAID } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow }
  });

  const pendingOrders = await Order.countDocuments({
    status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING] }
  });

  // Compare with yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayBills = await Bill.aggregate([
    { $match: { closedAt: { $gte: yesterday, $lt: today }, status: BILL_STATUS.PAID } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const todayStats = todayBills[0] || { revenue: 0, count: 0 };
  const yesterdayStats = yesterdayBills[0] || { revenue: 0, count: 0 };

  const revenueChange = yesterdayStats.revenue > 0
    ? Math.round(((todayStats.revenue - yesterdayStats.revenue) / yesterdayStats.revenue) * 100)
    : 0;

  return {
    today: {
      revenue: todayStats.revenue,
      billCount: todayStats.count,
      orderCount: todayOrders,
      pendingOrders
    },
    comparison: {
      revenueChange,
      revenueChangeType: revenueChange >= 0 ? 'increase' : 'decrease'
    },
    timestamp: new Date()
  };
};

module.exports = {
  getRevenueReport,
  getPopularItemsReport,
  getOperationalMetrics,
  getStaffPerformanceReport,
  getReviewStats,
  getDashboardSummary
};
