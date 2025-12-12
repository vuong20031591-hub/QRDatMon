/**
 * Incident Routes
 * Requirements: 18.1, 18.2, 18.3, 18.4
 */

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incident.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireStaff } = require('../middleware/roleGuard');
const { USER_ROLES } = require('../utils/constants');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/incidents/stats
 * @desc    Get incident statistics
 * @access  Manager, Admin
 */
router.get(
  '/stats',
  requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  incidentController.getIncidentStats
);

/**
 * @route   GET /api/incidents
 * @desc    Get incident reports with filters
 * @access  Manager, Admin
 */
router.get(
  '/',
  requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  incidentController.getIncidents
);

/**
 * @route   POST /api/incidents
 * @desc    Report a new incident
 * @access  All Staff
 */
router.post(
  '/',
  requireStaff,
  incidentController.reportIncident
);

/**
 * @route   GET /api/incidents/:id
 * @desc    Get incident by ID
 * @access  All Staff
 */
router.get(
  '/:id',
  requireStaff,
  incidentController.getIncident
);

/**
 * @route   PUT /api/incidents/:id/start
 * @desc    Start handling an incident
 * @access  Manager, Admin
 */
router.put(
  '/:id/start',
  requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  incidentController.startHandling
);

/**
 * @route   PUT /api/incidents/:id/resolve
 * @desc    Resolve an incident
 * @access  Manager, Admin
 */
router.put(
  '/:id/resolve',
  requireRole([USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  incidentController.resolveIncident
);

module.exports = router;
