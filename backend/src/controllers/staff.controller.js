/**
 * Staff Controller
 * Handles staff-related HTTP requests
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

const staffService = require('../services/staff.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ok, created, paginated } = require('../utils/response');

/**
 * Get all staff
 * GET /api/staff
 * Admin/Manager only
 */
const getStaff = asyncHandler(async (req, res) => {
  const { role, isActive, search, page, limit, sortBy, sortOrder } = req.query;

  const filters = {
    role,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    search
  };

  const pagination = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    sortBy,
    sortOrder
  };

  const result = await staffService.getStaff(filters, pagination);

  return paginated(res, result.staff, result.pagination, 'Staff retrieved successfully');
});

/**
 * Get staff by ID
 * GET /api/staff/:id
 * Admin/Manager only
 */
const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await staffService.getStaffById(id);
  return ok(res, { staff }, 'Staff retrieved successfully');
});

/**
 * Get current staff profile
 * GET /api/staff/me
 * Staff only
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const staff = await staffService.getStaffByUserId(userId);
  return ok(res, { staff }, 'Staff profile retrieved successfully');
});

/**
 * Create new staff
 * POST /api/staff
 * Admin only
 */
const createStaff = asyncHandler(async (req, res) => {
  const { userId, employeeCode, role, hireDate } = req.body;

  const staff = await staffService.createStaff({
    userId,
    employeeCode,
    role,
    hireDate
  });

  return created(res, { staff }, 'Staff created successfully');
});


/**
 * Update staff
 * PUT /api/staff/:id
 * Admin only
 */
const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { employeeCode, role, hireDate } = req.body;

  const staff = await staffService.updateStaff(id, {
    employeeCode,
    role,
    hireDate
  });

  return ok(res, { staff }, 'Staff updated successfully');
});

/**
 * Deactivate staff
 * PUT /api/staff/:id/deactivate
 * Admin only
 */
const deactivateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await staffService.deactivateStaff(id);
  return ok(res, { staff }, 'Staff deactivated successfully');
});

/**
 * Activate staff
 * PUT /api/staff/:id/activate
 * Admin only
 */
const activateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await staffService.activateStaff(id);
  return ok(res, { staff }, 'Staff activated successfully');
});

/**
 * Clock in
 * POST /api/staff/clock-in
 * Staff only
 */
const clockIn = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shiftType, note } = req.body;

  // Get staff by user ID
  const staffProfile = await staffService.getStaffByUserId(userId);
  
  const shift = await staffService.clockIn(staffProfile.id, { shiftType, note });

  return created(res, { shift }, 'Clocked in successfully');
});

/**
 * Clock out
 * POST /api/staff/clock-out
 * Staff only
 */
const clockOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { note } = req.body;

  const staffProfile = await staffService.getStaffByUserId(userId);
  
  const shift = await staffService.clockOut(staffProfile.id, { note });

  return ok(res, { shift }, 'Clocked out successfully');
});

/**
 * Get my shift history
 * GET /api/staff/my-shifts
 * Staff only
 */
const getMyShifts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, shiftType, page, limit } = req.query;

  const staffProfile = await staffService.getStaffByUserId(userId);

  const result = await staffService.getShiftHistory(
    staffProfile.id,
    { startDate, endDate, shiftType },
    { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20 }
  );

  return paginated(res, result.shifts, result.pagination, 'Shift history retrieved successfully');
});

/**
 * Get shift history for a staff member
 * GET /api/staff/:id/shifts
 * Admin/Manager only
 */
const getStaffShifts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, shiftType, page, limit } = req.query;

  const result = await staffService.getShiftHistory(
    id,
    { startDate, endDate, shiftType },
    { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20 }
  );

  return ok(res, result, 'Shift history retrieved successfully');
});

/**
 * Get all shifts
 * GET /api/staff/shifts
 * Admin/Manager only
 */
const getAllShifts = asyncHandler(async (req, res) => {
  const { staffId, startDate, endDate, shiftType, page, limit } = req.query;

  const result = await staffService.getAllShifts(
    { staffId, startDate, endDate, shiftType },
    { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20 }
  );

  return paginated(res, result.shifts, result.pagination, 'Shifts retrieved successfully');
});

/**
 * Get current active shift
 * GET /api/staff/active-shift
 * Staff only
 */
const getActiveShift = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const staffProfile = await staffService.getStaffByUserId(userId);
  const shift = await staffService.getActiveShift(staffProfile.id);
  return ok(res, { shift }, shift ? 'Active shift found' : 'No active shift');
});

module.exports = {
  getStaff,
  getStaffById,
  getMyProfile,
  createStaff,
  updateStaff,
  deactivateStaff,
  activateStaff,
  clockIn,
  clockOut,
  getMyShifts,
  getStaffShifts,
  getAllShifts,
  getActiveShift
};
