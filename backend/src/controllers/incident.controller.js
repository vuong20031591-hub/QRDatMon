/**
 * Incident Controller
 * Handles HTTP requests for incident management
 * Requirements: 18.1, 18.2, 18.3, 18.4
 */

const incidentService = require('../services/incident.service');
const { ok, created, paginated } = require('../utils/response');

/**
 * Report a new incident
 * POST /api/incidents
 */
const reportIncident = async (req, res, next) => {
  try {
    const { orderId, orderItemId, type, description } = req.body;

    const incident = await incidentService.reportIncident(
      { orderId, orderItemId, type, description },
      req.staff
    );

    return created(res, { incident }, 'Incident reported successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve an incident
 * PUT /api/incidents/:id/resolve
 */
const resolveIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const incident = await incidentService.resolveIncident(
      id,
      { resolution },
      req.staff
    );

    return ok(res, { incident }, 'Incident resolved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Start handling an incident
 * PUT /api/incidents/:id/start
 */
const startHandling = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incident = await incidentService.startHandlingIncident(id, req.staff);

    return ok(res, { incident }, 'Started handling incident');
  } catch (error) {
    next(error);
  }
};

/**
 * Get incident by ID
 * GET /api/incidents/:id
 */
const getIncident = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incident = await incidentService.getIncidentById(id);

    return ok(res, { incident }, 'Incident retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get incident reports with filters
 * GET /api/incidents
 */
const getIncidents = async (req, res, next) => {
  try {
    const {
      type,
      status,
      orderId,
      reportedBy,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (orderId) filters.orderId = orderId;
    if (reportedBy) filters.reportedBy = reportedBy;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'reportedAt',
      sortOrder: sortOrder || 'desc'
    };

    const result = await incidentService.getIncidentReports(filters, pagination);

    return paginated(res, result.incidents, { page: pagination.page, limit: pagination.limit, total: result.total }, 'Incidents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get incident statistics
 * GET /api/incidents/stats
 */
const getIncidentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await incidentService.getIncidentStats({ startDate, endDate });

    return ok(res, { stats }, 'Incident statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportIncident,
  resolveIncident,
  startHandling,
  getIncident,
  getIncidents,
  getIncidentStats
};
