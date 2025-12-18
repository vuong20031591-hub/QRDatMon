/**
 * Table Controller
 * Handles HTTP requests for table and QR code management
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

const tableService = require('../services/table.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created } = require('../utils/response');

/**
 * Get all tables
 * GET /api/tables
 */
const getTables = asyncHandler(async (req, res) => {
  const { area, status, active } = req.query;

  const filters = {
    area,
    status,
    isActive: active !== 'false'
  };

  const tables = await tableService.getTables(filters);

  return ok(res, { tables }, 'Tables retrieved successfully');
});

/**
 * Get table map grouped by area
 * GET /api/tables/map
 */
const getTableMap = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const tableMap = await tableService.getTableMap({
    includeInactive: includeInactive === 'true'
  });

  return ok(res, { areas: tableMap }, 'Table map retrieved successfully');
});

/**
 * Get a single table by ID
 * GET /api/tables/:id
 */
const getTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const table = await tableService.getTableById(id);

  return ok(res, { table }, 'Table retrieved successfully');
});

/**
 * Join a table using QR token
 * POST /api/tables/join
 */
const joinTable = asyncHandler(async (req, res) => {
  const { qrToken } = req.body;
  const user = req.user;

  const result = await tableService.joinTable(qrToken, user);

  return ok(res, result, result.isNewSession ? 'Joined table successfully' : 'Already at this table');
});

/**
 * Leave current table
 * POST /api/tables/:id/leave
 */
const leaveTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await tableService.leaveTable(userId, id);

  return ok(res, result, 'Left table successfully');
});

/**
 * Get user's active table session
 * GET /api/tables/my-session
 */
const getMySession = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const session = await tableService.getUserActiveSession(userId);

  if (!session) {
    return ok(res, { session: null }, 'No active table session');
  }

  return ok(res, session, 'Active session retrieved');
});

/**
 * Generate QR code for a table
 * POST /api/tables/:id/qr
 */
const generateQRCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { regenerate } = req.body;

  const qrInfo = await tableService.generateQRCode(id, {
    regenerate: regenerate === true
  });

  return ok(res, qrInfo, 'QR code generated successfully');
});

/**
 * Update table status
 * PATCH /api/tables/:id/status
 */
const updateTableStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const table = await tableService.updateTableStatus(id, status);

  return ok(res, { table }, 'Table status updated successfully');
});

/**
 * Create a new table
 * POST /api/tables
 */
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, area, capacity, position, status } = req.body;

  const table = await tableService.createTable({
    tableNumber,
    area,
    capacity,
    position,
    status
  });

  return created(res, { table }, 'Table created successfully');
});

/**
 * Update table information
 * PUT /api/tables/:id
 */
const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tableNumber, area, capacity, position, isActive, status } = req.body;

  const table = await tableService.updateTable(id, {
    tableNumber,
    area,
    capacity,
    position,
    isActive,
    status
  });

  return ok(res, { table }, 'Table updated successfully');
});

/**
 * Merge tables
 * POST /api/tables/merge
 */
const mergeTables = asyncHandler(async (req, res) => {
  const { tableIds, primaryTableId } = req.body;

  const result = await tableService.mergeTables(tableIds, primaryTableId);

  return ok(res, result, 'Tables merged successfully');
});

/**
 * Unmerge tables
 * POST /api/tables/unmerge
 */
const unmergeTables = asyncHandler(async (req, res) => {
  const { mergeId } = req.body;

  const result = await tableService.unmergeTables(mergeId);

  return ok(res, result, 'Tables unmerged successfully');
});

/**
 * Get all users in a table session
 * GET /api/tables/:id/users
 */
const getTableUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const users = await tableService.getTableSessionUsers(id);

  return ok(res, { users, count: users.length }, 'Table users retrieved successfully');
});

/**
 * Get combined bill for all users at a table
 * GET /api/tables/:id/combined-bill
 */
const getTableCombinedBill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await tableService.getTableCombinedBill(id);

  return ok(res, result, 'Combined bill retrieved successfully');
});

/**
 * Check if user can join a table
 * GET /api/tables/:id/can-join
 */
const canJoinTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await tableService.canUserJoinTable(id, userId);

  return ok(res, result, result.canJoin ? 'User can join table' : result.reason);
});

/**
 * Transfer user to another table
 * POST /api/tables/:id/transfer
 */
const transferToTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const result = await tableService.transferUserToTable(userId, id);

  return ok(res, result, 'Transferred to table successfully');
});

module.exports = {
  getTables,
  getTableMap,
  getTableById,
  joinTable,
  leaveTable,
  getMySession,
  generateQRCode,
  updateTableStatus,
  createTable,
  updateTable,
  mergeTables,
  unmergeTables,
  // Multi-user endpoints
  getTableUsers,
  getTableCombinedBill,
  canJoinTable,
  transferToTable
};
