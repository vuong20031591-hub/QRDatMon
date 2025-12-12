/**
 * Staff Service
 * Handles staff management, shifts, clock in/out
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

const { Staff, Shift, User } = require('../models');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { PAGINATION } = require('../utils/constants');

/**
 * Get all staff with filters
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated staff list
 */
const getStaff = async (filters = {}, pagination = {}) => {
  const { role, isActive, search } = filters;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = pagination;

  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive;

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  let staffQuery = Staff.find(query)
    .populate('user', 'name email phone avatarUrl')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const [staffList, total] = await Promise.all([
    staffQuery.lean(),
    Staff.countDocuments(query)
  ]);

  // Filter by search if provided (search in user name/email)
  let filteredStaff = staffList;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredStaff = staffList.filter(s => 
      s.user?.name?.toLowerCase().includes(searchLower) ||
      s.user?.email?.toLowerCase().includes(searchLower) ||
      s.employeeCode?.toLowerCase().includes(searchLower)
    );
  }

  return {
    staff: filteredStaff.map(formatStaff),
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
 * Get staff by ID
 * @param {string} staffId - Staff ID
 * @returns {Promise<Object>} Staff details
 */
const getStaffById = async (staffId) => {
  const staff = await Staff.findById(staffId)
    .populate('user', 'name email phone avatarUrl')
    .lean();

  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  return formatStaff(staff);
};

/**
 * Get staff by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Staff details
 */
const getStaffByUserId = async (userId) => {
  const staff = await Staff.findOne({ user: userId })
    .populate('user', 'name email phone avatarUrl')
    .lean();

  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  return formatStaff(staff);
};


/**
 * Create new staff
 * @param {Object} data - Staff data
 * @returns {Promise<Object>} Created staff
 */
const createStaff = async (data) => {
  const { userId, employeeCode, role, hireDate } = data;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if user is already staff
  const existingStaff = await Staff.findOne({ user: userId });
  if (existingStaff) {
    throw new ConflictError('User is already a staff member');
  }

  // Check if employee code is unique
  const existingCode = await Staff.findOne({ employeeCode: employeeCode.toUpperCase() });
  if (existingCode) {
    throw new ConflictError('Employee code already exists');
  }

  const staff = await Staff.create({
    user: userId,
    employeeCode: employeeCode.toUpperCase(),
    role,
    hireDate: hireDate || new Date(),
    isActive: true
  });

  // Update user role and mark as non-guest (staff cannot be guest)
  await User.findByIdAndUpdate(userId, { role, isGuest: false });

  return getStaffById(staff._id);
};

/**
 * Update staff
 * @param {string} staffId - Staff ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated staff
 */
const updateStaff = async (staffId, data) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  const { employeeCode, role, hireDate } = data;

  // Check employee code uniqueness if changing
  if (employeeCode && employeeCode.toUpperCase() !== staff.employeeCode) {
    const existingCode = await Staff.findOne({ 
      employeeCode: employeeCode.toUpperCase(),
      _id: { $ne: staffId }
    });
    if (existingCode) {
      throw new ConflictError('Employee code already exists');
    }
  }

  const updateData = {};
  if (employeeCode) updateData.employeeCode = employeeCode.toUpperCase();
  if (role) updateData.role = role;
  if (hireDate) updateData.hireDate = hireDate;

  await Staff.findByIdAndUpdate(staffId, updateData);

  // Update user role if changed
  if (role) {
    await User.findByIdAndUpdate(staff.user, { role });
  }

  return getStaffById(staffId);
};

/**
 * Deactivate staff
 * @param {string} staffId - Staff ID
 * @returns {Promise<Object>} Deactivated staff
 */
const deactivateStaff = async (staffId) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  await Staff.findByIdAndUpdate(staffId, { isActive: false });

  // Update user to customer role
  await User.findByIdAndUpdate(staff.user, { role: 'customer' });

  return getStaffById(staffId);
};

/**
 * Activate staff
 * @param {string} staffId - Staff ID
 * @returns {Promise<Object>} Activated staff
 */
const activateStaff = async (staffId) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  await Staff.findByIdAndUpdate(staffId, { isActive: true });

  // Restore user role
  await User.findByIdAndUpdate(staff.user, { role: staff.role });

  return getStaffById(staffId);
};

/**
 * Clock in - Start shift
 * @param {string} staffId - Staff ID
 * @param {Object} data - Shift data
 * @returns {Promise<Object>} Created shift
 */
const clockIn = async (staffId, data = {}) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  if (!staff.isActive) {
    throw new ValidationError('Staff account is inactive');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already clocked in today without clock out
  const existingShift = await Shift.findOne({
    staff: staffId,
    workDate: today,
    checkInAt: { $exists: true },
    checkOutAt: { $exists: false }
  });

  if (existingShift) {
    throw new ConflictError('Already clocked in. Please clock out first.');
  }

  const { shiftType, note } = data;

  // Determine shift type based on current time if not provided
  const currentHour = new Date().getHours();
  let autoShiftType = shiftType;
  if (!autoShiftType) {
    if (currentHour >= 6 && currentHour < 14) {
      autoShiftType = 'morning';
    } else if (currentHour >= 14 && currentHour < 22) {
      autoShiftType = 'afternoon';
    } else {
      autoShiftType = 'evening';
    }
  }

  const shift = await Shift.create({
    staff: staffId,
    shiftType: autoShiftType,
    workDate: today,
    checkInAt: new Date(),
    note
  });

  return formatShift(shift, staff);
};


/**
 * Clock out - End shift
 * @param {string} staffId - Staff ID
 * @param {Object} data - Clock out data
 * @returns {Promise<Object>} Updated shift
 */
const clockOut = async (staffId, data = {}) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find active shift
  const activeShift = await Shift.findOne({
    staff: staffId,
    workDate: today,
    checkInAt: { $exists: true },
    checkOutAt: { $exists: false }
  });

  if (!activeShift) {
    throw new ValidationError('No active shift found. Please clock in first.');
  }

  const { note } = data;

  activeShift.checkOutAt = new Date();
  if (note) activeShift.note = note;
  await activeShift.save();

  return formatShift(activeShift, staff);
};

/**
 * Get shift history for a staff member
 * @param {string} staffId - Staff ID
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated shift history
 */
const getShiftHistory = async (staffId, filters = {}, pagination = {}) => {
  const staff = await Staff.findById(staffId).populate('user', 'name');
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  const { startDate, endDate, shiftType } = filters;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = pagination;

  const query = { staff: staffId };

  if (shiftType) query.shiftType = shiftType;
  if (startDate || endDate) {
    query.workDate = {};
    if (startDate) query.workDate.$gte = new Date(startDate);
    if (endDate) query.workDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [shifts, total] = await Promise.all([
    Shift.find(query)
      .sort({ workDate: -1, checkInAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Shift.countDocuments(query)
  ]);

  return {
    staff: {
      id: staff._id,
      employeeCode: staff.employeeCode,
      name: staff.user?.name
    },
    shifts: shifts.map(s => formatShift(s, staff)),
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
 * Get all shifts with filters (for admin)
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated shifts
 */
const getAllShifts = async (filters = {}, pagination = {}) => {
  const { staffId, startDate, endDate, shiftType } = filters;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT
  } = pagination;

  const query = {};

  if (staffId) query.staff = staffId;
  if (shiftType) query.shiftType = shiftType;
  if (startDate || endDate) {
    query.workDate = {};
    if (startDate) query.workDate.$gte = new Date(startDate);
    if (endDate) query.workDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [shifts, total] = await Promise.all([
    Shift.find(query)
      .populate({
        path: 'staff',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ workDate: -1, checkInAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Shift.countDocuments(query)
  ]);

  return {
    shifts: shifts.map(s => formatShift(s, s.staff)),
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
 * Get current active shift for staff
 * @param {string} staffId - Staff ID
 * @returns {Promise<Object|null>} Active shift or null
 */
const getActiveShift = async (staffId) => {
  const staff = await Staff.findById(staffId).populate('user', 'name');
  if (!staff) {
    throw new NotFoundError('Staff not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeShift = await Shift.findOne({
    staff: staffId,
    workDate: today,
    checkInAt: { $exists: true },
    checkOutAt: { $exists: false }
  }).lean();

  return activeShift ? formatShift(activeShift, staff) : null;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format staff for API response
 */
const formatStaff = (staff) => {
  return {
    id: staff._id,
    employeeCode: staff.employeeCode,
    role: staff.role,
    hireDate: staff.hireDate,
    isActive: staff.isActive,
    user: staff.user ? {
      id: staff.user._id,
      name: staff.user.name,
      email: staff.user.email,
      phone: staff.user.phone,
      avatarUrl: staff.user.avatarUrl
    } : null,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt
  };
};

/**
 * Format shift for API response
 */
const formatShift = (shift, staff) => {
  const checkIn = shift.checkInAt ? new Date(shift.checkInAt) : null;
  const checkOut = shift.checkOutAt ? new Date(shift.checkOutAt) : null;
  
  let duration = null;
  if (checkIn && checkOut) {
    const diffMs = checkOut - checkIn;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    duration = { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
  }

  return {
    id: shift._id,
    staff: staff ? {
      id: staff._id,
      employeeCode: staff.employeeCode,
      name: staff.user?.name
    } : null,
    shiftType: shift.shiftType,
    workDate: shift.workDate,
    startTime: shift.startTime,
    endTime: shift.endTime,
    checkInAt: shift.checkInAt,
    checkOutAt: shift.checkOutAt,
    duration,
    note: shift.note,
    createdAt: shift.createdAt
  };
};

module.exports = {
  getStaff,
  getStaffById,
  getStaffByUserId,
  createStaff,
  updateStaff,
  deactivateStaff,
  activateStaff,
  clockIn,
  clockOut,
  getShiftHistory,
  getAllShifts,
  getActiveShift,
  formatStaff,
  formatShift
};
