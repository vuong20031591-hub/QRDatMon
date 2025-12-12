/**
 * Incident Service
 * Handles incident reporting and resolution
 * Requirements: 18.1, 18.2, 18.3, 18.4
 */

const { Incident, Order, Staff } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { PAGINATION } = require('../utils/constants');
const { emitIncidentCreated, emitIncidentResolved } = require('../socket/emitters');

// Incident types
const INCIDENT_TYPES = {
  RETURNED: 'returned',
  WRONG_ORDER: 'wrong_order',
  QUALITY_ISSUE: 'quality_issue',
  DELAY: 'delay',
  OTHER: 'other'
};

// Incident statuses
const INCIDENT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved'
};

/**
 * Report a new incident
 * @param {Object} data - Incident data
 * @param {Object} staff - Staff reporting the incident
 * @returns {Promise<Object>} Created incident
 */
const reportIncident = async (data, staff) => {
  const { orderId, orderItemId, type, description } = data;

  // Validate order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Validate order item exists in order
  const orderItem = order.items.find(item => item._id.toString() === orderItemId);
  if (!orderItem) {
    throw new NotFoundError('Order item not found in this order');
  }

  // Validate incident type
  if (!Object.values(INCIDENT_TYPES).includes(type)) {
    throw new ValidationError(`Invalid incident type. Must be one of: ${Object.values(INCIDENT_TYPES).join(', ')}`);
  }

  // Create incident
  const incident = await Incident.create({
    order: orderId,
    orderItemId,
    reportedBy: staff._id,
    type,
    description,
    status: INCIDENT_STATUS.OPEN,
    reportedAt: new Date()
  });

  // Populate for response
  const populatedIncident = await Incident.findById(incident._id)
    .populate('order', 'orderNumber')
    .populate('reportedBy', 'name employeeCode')
    .lean();

  // Emit notification to managers
  emitIncidentCreated({
    incidentId: incident._id,
    type,
    orderNumber: order.orderNumber,
    itemName: orderItem.itemName,
    reportedBy: staff.name
  });

  return formatIncident(populatedIncident);
};

/**
 * Resolve an incident
 * @param {string} incidentId - Incident ID
 * @param {Object} data - Resolution data
 * @param {Object} staff - Staff resolving the incident
 * @returns {Promise<Object>} Resolved incident
 */
const resolveIncident = async (incidentId, data, staff) => {
  const { resolution } = data;

  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new NotFoundError('Incident not found');
  }

  if (incident.status === INCIDENT_STATUS.RESOLVED) {
    throw new ValidationError('Incident is already resolved');
  }

  incident.status = INCIDENT_STATUS.RESOLVED;
  incident.resolution = resolution;
  incident.resolvedBy = staff._id;
  incident.resolvedAt = new Date();

  await incident.save();

  // Populate for response
  const populatedIncident = await Incident.findById(incident._id)
    .populate('order', 'orderNumber')
    .populate('reportedBy', 'name employeeCode')
    .populate('resolvedBy', 'name employeeCode')
    .lean();

  // Emit notification
  emitIncidentResolved({
    incidentId: incident._id,
    resolvedBy: staff.name
  });

  return formatIncident(populatedIncident);
};

/**
 * Update incident status to in_progress
 * @param {string} incidentId - Incident ID
 * @param {Object} staff - Staff handling the incident
 * @returns {Promise<Object>} Updated incident
 */
const startHandlingIncident = async (incidentId, staff) => {
  const incident = await Incident.findById(incidentId);

  if (!incident) {
    throw new NotFoundError('Incident not found');
  }

  if (incident.status !== INCIDENT_STATUS.OPEN) {
    throw new ValidationError('Can only start handling open incidents');
  }

  incident.status = INCIDENT_STATUS.IN_PROGRESS;
  await incident.save();

  const populatedIncident = await Incident.findById(incident._id)
    .populate('order', 'orderNumber')
    .populate('reportedBy', 'name employeeCode')
    .lean();

  return formatIncident(populatedIncident);
};

/**
 * Get incident by ID
 * @param {string} incidentId - Incident ID
 * @returns {Promise<Object>} Incident details
 */
const getIncidentById = async (incidentId) => {
  const incident = await Incident.findById(incidentId)
    .populate('order', 'orderNumber items')
    .populate('reportedBy', 'name employeeCode role')
    .populate('resolvedBy', 'name employeeCode role')
    .lean();

  if (!incident) {
    throw new NotFoundError('Incident not found');
  }

  return formatIncident(incident);
};

/**
 * Get incident reports with filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated incidents
 */
const getIncidentReports = async (filters = {}, pagination = {}) => {
  const {
    type,
    status,
    orderId,
    reportedBy,
    startDate,
    endDate
  } = filters;

  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'reportedAt',
    sortOrder = 'desc'
  } = pagination;

  // Build query
  const query = {};

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (orderId) {
    query.order = orderId;
  }

  if (reportedBy) {
    query.reportedBy = reportedBy;
  }

  if (startDate || endDate) {
    query.reportedAt = {};
    if (startDate) query.reportedAt.$gte = new Date(startDate);
    if (endDate) query.reportedAt.$lte = new Date(endDate);
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [incidents, total] = await Promise.all([
    Incident.find(query)
      .populate('order', 'orderNumber')
      .populate('reportedBy', 'name employeeCode')
      .populate('resolvedBy', 'name employeeCode')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Incident.countDocuments(query)
  ]);

  return {
    incidents: incidents.map(formatIncident),
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
 * Get incident statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Incident statistics
 */
const getIncidentStats = async (options = {}) => {
  const { startDate, endDate } = options;

  const matchStage = {};
  if (startDate || endDate) {
    matchStage.reportedAt = {};
    if (startDate) matchStage.reportedAt.$gte = new Date(startDate);
    if (endDate) matchStage.reportedAt.$lte = new Date(endDate);
  }

  const [byType, byStatus, total] = await Promise.all([
    // Count by type
    Incident.aggregate([
      { $match: matchStage },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    // Count by status
    Incident.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    // Total count
    Incident.countDocuments(matchStage)
  ]);

  return {
    total,
    byType: byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byStatus: byStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

/**
 * Format incident for API response
 */
const formatIncident = (incident) => {
  // Find the order item details
  let orderItemDetails = null;
  if (incident.order?.items && incident.orderItemId) {
    const item = incident.order.items.find(
      i => i._id.toString() === incident.orderItemId.toString()
    );
    if (item) {
      orderItemDetails = {
        id: item._id,
        itemName: item.itemName,
        quantity: item.quantity
      };
    }
  }

  return {
    id: incident._id,
    order: incident.order ? {
      id: incident.order._id || incident.order,
      orderNumber: incident.order.orderNumber || null
    } : null,
    orderItemId: incident.orderItemId,
    orderItem: orderItemDetails,
    reportedBy: incident.reportedBy ? {
      id: incident.reportedBy._id || incident.reportedBy,
      name: incident.reportedBy.name || null,
      employeeCode: incident.reportedBy.employeeCode || null
    } : null,
    resolvedBy: incident.resolvedBy ? {
      id: incident.resolvedBy._id || incident.resolvedBy,
      name: incident.resolvedBy.name || null,
      employeeCode: incident.resolvedBy.employeeCode || null
    } : null,
    type: incident.type,
    description: incident.description,
    status: incident.status,
    resolution: incident.resolution || null,
    reportedAt: incident.reportedAt,
    resolvedAt: incident.resolvedAt || null,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt
  };
};

module.exports = {
  reportIncident,
  resolveIncident,
  startHandlingIncident,
  getIncidentById,
  getIncidentReports,
  getIncidentStats,
  formatIncident,
  INCIDENT_TYPES,
  INCIDENT_STATUS
};
