/**
 * Table Service
 * Handles table management, QR codes, and session management
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

const crypto = require('crypto');
const { Table, Area, TableSession, Bill, TableMerge } = require('../models');
const {
  NotFoundError,
  ValidationError,
  ConflictError,
  TableOccupiedError
} = require('../utils/errors');
const { TABLE_STATUS, BILL_STATUS } = require('../utils/constants');
const {
  emitTableStatusChanged,
  emitUserJoinedTable,
  emitUserLeftTable
} = require('../socket/emitters');

/**
 * Get all tables with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of tables
 */
const getTables = async (filters = {}) => {
  const { area, status, isActive = true } = filters;

  const query = {};

  if (area) {
    query.area = area;
  }

  if (status) {
    query.status = status;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  const tables = await Table.find(query)
    .populate('area', 'name floor')
    .sort({ area: 1, tableNumber: 1 })
    .lean();

  return tables.map(formatTable);
};

/**
 * Get table map grouped by area
 * @param {Object} options - Options
 * @returns {Promise<Array>} Tables grouped by area
 */
const getTableMap = async (options = {}) => {
  const { includeInactive = false } = options;

  // Get all active areas
  const areaFilter = includeInactive ? {} : { isActive: true };
  const areas = await Area.find(areaFilter)
    .sort({ floor: 1, sortOrder: 1 })
    .lean();

  // Get all tables
  const tableFilter = includeInactive ? {} : { isActive: true };
  const tables = await Table.find(tableFilter)
    .sort({ tableNumber: 1 })
    .lean();

  // Get active sessions for occupied tables
  const occupiedTableIds = tables
    .filter(t => t.status === TABLE_STATUS.OCCUPIED)
    .map(t => t._id);

  const activeSessions = await TableSession.find({
    table: { $in: occupiedTableIds },
    isActive: true
  })
    .populate('bill', 'billNumber guestCount totalAmount')
    .lean();

  // Create session map for quick lookup
  const sessionMap = {};
  activeSessions.forEach(session => {
    if (!sessionMap[session.table.toString()]) {
      sessionMap[session.table.toString()] = [];
    }
    sessionMap[session.table.toString()].push(session);
  });

  // Group tables by area
  const tableMap = areas.map(area => ({
    area: {
      id: area._id,
      name: area.name,
      floor: area.floor,
      description: area.description
    },
    tables: tables
      .filter(table => table.area.toString() === area._id.toString())
      .map(table => {
        const sessions = sessionMap[table._id.toString()] || [];
        return {
          ...formatTable(table),
          currentSession: sessions.length > 0 ? {
            guestCount: sessions.length,
            bill: sessions[0]?.bill || null
          } : null
        };
      })
  }));

  return tableMap;
};

/**
 * Get a single table by ID
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Table details
 */
const getTableById = async (tableId) => {
  const table = await Table.findById(tableId)
    .populate('area', 'name floor description')
    .lean();

  if (!table) {
    throw new NotFoundError('Table not found', 'Table');
  }

  // Get active sessions if occupied
  let currentSessions = [];
  if (table.status === TABLE_STATUS.OCCUPIED) {
    currentSessions = await TableSession.find({
      table: tableId,
      isActive: true
    })
      .populate('user', 'name email')
      .populate('bill', 'billNumber totalAmount status')
      .lean();
  }

  return {
    ...formatTable(table),
    currentSessions: currentSessions.map(s => ({
      id: s._id,
      user: s.user ? { id: s.user._id, name: s.user.name } : null,
      bill: s.bill,
      joinedAt: s.joinedAt
    }))
  };
};

/**
 * Join a table using QR token
 * @param {string} qrToken - QR token from scanned code
 * @param {Object} user - User joining the table
 * @returns {Promise<Object>} Table session info
 */
const joinTable = async (qrToken, user) => {
  // Find table by QR token
  const table = await Table.findOne({ qrToken, isActive: true })
    .populate('area', 'name floor');

  if (!table) {
    throw new ValidationError('Invalid or expired QR code', [
      { field: 'qrToken', message: 'QR code is invalid or has expired' }
    ]);
  }

  // Check if table is available or occupied (can join existing session)
  if (table.status === TABLE_STATUS.RESERVED) {
    throw new TableOccupiedError('This table is reserved');
  }

  if (table.status === TABLE_STATUS.CLEANING) {
    throw new ValidationError('This table is being cleaned. Please wait.');
  }

  // Check if user already has an active session at this table
  const existingSession = await TableSession.findOne({
    user: user._id,
    table: table._id,
    isActive: true
  });

  if (existingSession) {
    // Return existing session
    const bill = await Bill.findById(existingSession.bill);
    return {
      session: formatSession(existingSession),
      table: formatTable(table),
      bill: bill ? formatBill(bill) : null,
      isNewSession: false
    };
  }

  // Find or create bill for this table
  let bill = await Bill.findOne({
    table: table._id,
    status: { $in: [BILL_STATUS.OPEN, BILL_STATUS.REQUESTING_PAYMENT] }
  });

  const isNewBill = !bill;

  if (!bill) {
    // Create new bill
    const billNumber = generateBillNumber();
    bill = await Bill.create({
      table: table._id,
      billNumber,
      guestCount: 1,
      status: BILL_STATUS.OPEN,
      openedAt: new Date()
    });
  } else {
    // Increment guest count
    bill.guestCount += 1;
    await bill.save();
  }

  // Create table session
  const session = await TableSession.create({
    user: user._id,
    table: table._id,
    bill: bill._id,
    joinedAt: new Date(),
    isActive: true
  });

  // Update table status to occupied if it was available
  if (table.status === TABLE_STATUS.AVAILABLE) {
    table.status = TABLE_STATUS.OCCUPIED;
    await table.save();
    emitTableStatusChanged(table);
  }

  // Emit user joined event
  emitUserJoinedTable({
    tableId: table._id.toString(),
    userId: user._id.toString(),
    userName: user.name || user.email || 'Guest'
  });

  return {
    session: formatSession(session),
    table: formatTable(table),
    bill: formatBill(bill),
    isNewSession: true,
    isNewBill
  };
};

/**
 * Leave a table (end session)
 * @param {string} userId - User ID
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Result
 */
const leaveTable = async (userId, tableId) => {
  const session = await TableSession.findOne({
    user: userId,
    table: tableId,
    isActive: true
  });

  if (!session) {
    throw new NotFoundError('No active session found for this table');
  }

  // End session
  session.isActive = false;
  session.leftAt = new Date();
  await session.save();

  // Check if there are other active sessions for this table
  const remainingSessions = await TableSession.countDocuments({
    table: tableId,
    isActive: true
  });

  // Update bill guest count
  if (session.bill) {
    const bill = await Bill.findById(session.bill);
    if (bill && bill.guestCount > 1) {
      bill.guestCount -= 1;
      await bill.save();
    }
  }

  // If no more sessions, table can be set to cleaning (optionally)
  // For now, we'll leave it as occupied until bill is paid

  // Emit user left event
  emitUserLeftTable({
    tableId,
    userId
  });

  return {
    message: 'Successfully left the table',
    remainingGuests: remainingSessions
  };
};

/**
 * Generate QR code for a table
 * @param {string} tableId - Table ID
 * @param {Object} options - Options
 * @returns {Promise<Object>} QR code info
 */
const generateQRCode = async (tableId, options = {}) => {
  const { regenerate = false } = options;

  const table = await Table.findById(tableId);

  if (!table) {
    throw new NotFoundError('Table not found', 'Table');
  }

  // Generate new token if requested or if none exists
  if (regenerate || !table.qrToken) {
    table.qrToken = crypto.randomBytes(16).toString('hex');
    await table.save();
  }

  // Generate QR code URL (using a QR code service or local generation)
  const qrData = JSON.stringify({
    type: 'table',
    token: table.qrToken,
    tableId: table._id,
    tableNumber: table.tableNumber
  });

  // For now, return the token. In production, you'd generate actual QR image
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  return {
    tableId: table._id,
    tableNumber: table.tableNumber,
    qrToken: table.qrToken,
    qrCodeUrl,
    qrData
  };
};

/**
 * Update table status
 * @param {string} tableId - Table ID
 * @param {string} status - New status
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Updated table
 */
const updateTableStatus = async (tableId, status, options = {}) => {
  const validStatuses = Object.values(TABLE_STATUS);
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const table = await Table.findById(tableId);

  if (!table) {
    throw new NotFoundError('Table not found', 'Table');
  }

  // If setting to available, check for unpaid bills
  if (status === TABLE_STATUS.AVAILABLE) {
    const openBill = await Bill.findOne({
      table: tableId,
      status: { $in: [BILL_STATUS.OPEN, BILL_STATUS.REQUESTING_PAYMENT] }
    });

    if (openBill) {
      throw new ValidationError('Cannot set table to available while there is an unpaid bill');
    }

    // End all active sessions
    await TableSession.updateMany(
      { table: tableId, isActive: true },
      { isActive: false, leftAt: new Date() }
    );
  }

  table.status = status;
  await table.save();

  // Emit real-time event
  emitTableStatusChanged(table);

  return getTableById(tableId);
};

/**
 * Create a new table
 * @param {Object} data - Table data
 * @returns {Promise<Object>} Created table
 */
const createTable = async (data) => {
  const { tableNumber, area, capacity, position, status } = data;

  // Validate area exists
  const areaDoc = await Area.findById(area);
  if (!areaDoc) {
    throw new ValidationError('Invalid area ID');
  }

  // Check for duplicate table number
  const existingTable = await Table.findOne({ tableNumber });
  if (existingTable) {
    throw new ConflictError(`Table "${tableNumber}" already exists`);
  }

  // Generate QR token
  const qrToken = crypto.randomBytes(16).toString('hex');

  const table = await Table.create({
    tableNumber,
    area,
    capacity: capacity || 4,
    position: position || { x: 0, y: 0 },
    status: status || TABLE_STATUS.AVAILABLE,
    qrToken,
    isActive: true
  });

  return getTableById(table._id);
};

/**
 * Update table information
 * @param {string} tableId - Table ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated table
 */
const updateTable = async (tableId, data) => {
  const table = await Table.findById(tableId);

  if (!table) {
    throw new NotFoundError('Table not found', 'Table');
  }

  // If changing table number, check for duplicates
  if (data.tableNumber && data.tableNumber !== table.tableNumber) {
    const existingTable = await Table.findOne({
      _id: { $ne: tableId },
      tableNumber: data.tableNumber
    });
    if (existingTable) {
      throw new ConflictError(`Table "${data.tableNumber}" already exists`);
    }
  }

  // If changing area, validate it exists
  if (data.area && data.area !== table.area.toString()) {
    const areaDoc = await Area.findById(data.area);
    if (!areaDoc) {
      throw new ValidationError('Invalid area ID');
    }
  }

  // Update allowed fields
  const allowedFields = ['tableNumber', 'area', 'capacity', 'position', 'isActive'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      table[field] = data[field];
    }
  });

  await table.save();

  return getTableById(table._id);
};

/**
 * Merge tables
 * @param {Array<string>} tableIds - Table IDs to merge
 * @param {string} primaryTableId - Primary table ID
 * @returns {Promise<Object>} Merge result
 */
const mergeTables = async (tableIds, primaryTableId) => {
  if (!tableIds || tableIds.length < 2) {
    throw new ValidationError('At least 2 tables are required for merge');
  }

  if (!tableIds.includes(primaryTableId)) {
    throw new ValidationError('Primary table must be one of the merged tables');
  }

  // Verify all tables exist and are available/occupied
  const tables = await Table.find({ _id: { $in: tableIds } });

  if (tables.length !== tableIds.length) {
    throw new NotFoundError('One or more tables not found');
  }

  // Check all tables are in same area
  const areas = [...new Set(tables.map(t => t.area.toString()))];
  if (areas.length > 1) {
    throw new ValidationError('All tables must be in the same area');
  }

  // Create merge record
  const merge = await TableMerge.create({
    primaryTable: primaryTableId,
    secondaryTables: tableIds.filter(id => id !== primaryTableId),
    mergedAt: new Date(),
    isActive: true
  });

  return {
    mergeId: merge._id,
    primaryTable: primaryTableId,
    mergedTables: tableIds,
    message: 'Tables merged successfully'
  };
};

/**
 * Unmerge tables
 * @param {string} mergeId - Merge record ID
 * @returns {Promise<Object>} Unmerge result
 */
const unmergeTables = async (mergeId) => {
  const merge = await TableMerge.findById(mergeId);

  if (!merge) {
    throw new NotFoundError('Merge record not found');
  }

  if (!merge.isActive) {
    throw new ValidationError('Tables are already unmerged');
  }

  merge.isActive = false;
  merge.unmergedAt = new Date();
  await merge.save();

  return {
    message: 'Tables unmerged successfully',
    primaryTable: merge.primaryTable,
    secondaryTables: merge.secondaryTables
  };
};

/**
 * Get user's active table session
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Active session or null
 */
const getUserActiveSession = async (userId) => {
  const session = await TableSession.findOne({
    user: userId,
    isActive: true
  })
    .populate('table')
    .populate('bill');

  if (!session) {
    return null;
  }

  return {
    session: formatSession(session),
    table: session.table ? formatTable(session.table) : null,
    bill: session.bill ? formatBill(session.bill) : null
  };
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique bill number
 */
const generateBillNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BILL-${dateStr}-${random}`;
};

/**
 * Format table for API response
 */
const formatTable = (table) => {
  return {
    id: table._id,
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    status: table.status,
    position: table.position,
    qrToken: table.qrToken,
    qrCodeUrl: table.qrCodeUrl,
    isActive: table.isActive,
    area: table.area ? {
      id: table.area._id || table.area,
      name: table.area.name || null,
      floor: table.area.floor || null
    } : null,
    createdAt: table.createdAt,
    updatedAt: table.updatedAt
  };
};

/**
 * Format session for API response
 */
const formatSession = (session) => {
  return {
    id: session._id,
    joinedAt: session.joinedAt,
    leftAt: session.leftAt,
    isActive: session.isActive
  };
};

/**
 * Format bill for API response
 */
const formatBill = (bill) => {
  return {
    id: bill._id,
    billNumber: bill.billNumber,
    guestCount: bill.guestCount,
    subtotal: bill.subtotal,
    discountAmount: bill.discountAmount,
    serviceChargeAmount: bill.serviceChargeAmount,
    vatAmount: bill.vatAmount,
    totalAmount: bill.totalAmount,
    status: bill.status,
    openedAt: bill.openedAt
  };
};

// ============================================
// Multi-User Table Session Functions (Phase 16)
// Requirements: 23.1, 23.2, 23.3, 23.4, 23.5
// ============================================

/**
 * Get all users in a table session
 * @param {string} tableId - Table ID
 * @returns {Promise<Array>} List of users in the session
 */
const getTableSessionUsers = async (tableId) => {
  const sessions = await TableSession.find({
    table: tableId,
    isActive: true
  })
    .populate('user', 'name email')
    .populate('bill', 'billNumber totalAmount')
    .lean();

  return sessions.map(session => ({
    sessionId: session._id,
    user: session.user ? {
      id: session.user._id,
      name: session.user.name,
      email: session.user.email
    } : null,
    joinedAt: session.joinedAt,
    bill: session.bill ? {
      id: session.bill._id,
      billNumber: session.bill.billNumber
    } : null
  }));
};

/**
 * Get combined bill for all users at a table
 * @param {string} tableId - Table ID
 * @returns {Promise<Object>} Combined bill with all orders
 */
const getTableCombinedBill = async (tableId) => {
  const { Order } = require('../models');

  // Get the active bill for this table
  const bill = await Bill.findOne({
    table: tableId,
    status: { $in: [BILL_STATUS.OPEN, BILL_STATUS.REQUESTING_PAYMENT] }
  }).lean();

  if (!bill) {
    throw new NotFoundError('No active bill found for this table');
  }

  // Get all orders for this bill
  const orders = await Order.find({ bill: bill._id })
    .populate('user', 'name email')
    .populate({
      path: 'items.menuItem',
      select: 'name imageUrl price'
    })
    .sort({ createdAt: 1 })
    .lean();

  // Get all active sessions
  const sessions = await TableSession.find({
    table: tableId,
    isActive: true
  })
    .populate('user', 'name email')
    .lean();

  // Group orders by user
  const ordersByUser = {};
  orders.forEach(order => {
    const userId = order.user?._id?.toString() || 'unknown';
    if (!ordersByUser[userId]) {
      ordersByUser[userId] = {
        user: order.user,
        orders: [],
        subtotal: 0
      };
    }
    ordersByUser[userId].orders.push(order);
    ordersByUser[userId].subtotal += order.totalAmount;
  });

  return {
    bill: formatBill(bill),
    guestCount: sessions.length,
    guests: sessions.map(s => ({
      id: s.user?._id,
      name: s.user?.name || 'Guest',
      joinedAt: s.joinedAt
    })),
    ordersByUser: Object.values(ordersByUser),
    totalOrders: orders.length,
    summary: {
      subtotal: bill.subtotal,
      serviceCharge: bill.serviceChargeAmount,
      vat: bill.vatAmount,
      discount: bill.discountAmount,
      total: bill.totalAmount
    }
  };
};

/**
 * Check if user can join table (validation)
 * @param {string} tableId - Table ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Validation result
 */
const canUserJoinTable = async (tableId, userId) => {
  const table = await Table.findById(tableId);

  if (!table) {
    return { canJoin: false, reason: 'Table not found' };
  }

  if (!table.isActive) {
    return { canJoin: false, reason: 'Table is not active' };
  }

  if (table.status === TABLE_STATUS.RESERVED) {
    return { canJoin: false, reason: 'Table is reserved' };
  }

  if (table.status === TABLE_STATUS.CLEANING) {
    return { canJoin: false, reason: 'Table is being cleaned' };
  }

  // Check if user already has active session at another table
  const existingSession = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (existingSession && existingSession.table.toString() !== tableId) {
    return {
      canJoin: false,
      reason: 'User already has an active session at another table',
      currentTableId: existingSession.table
    };
  }

  // Check table capacity
  const currentSessions = await TableSession.countDocuments({
    table: tableId,
    isActive: true
  });

  if (currentSessions >= table.capacity) {
    return {
      canJoin: false,
      reason: 'Table is at full capacity',
      capacity: table.capacity,
      currentGuests: currentSessions
    };
  }

  return {
    canJoin: true,
    table: formatTable(table),
    currentGuests: currentSessions,
    capacity: table.capacity
  };
};

/**
 * Transfer user to another table
 * @param {string} userId - User ID
 * @param {string} newTableId - New table ID
 * @returns {Promise<Object>} Transfer result
 */
const transferUserToTable = async (userId, newTableId) => {
  // Check if user can join new table
  const canJoin = await canUserJoinTable(newTableId, userId);
  if (!canJoin.canJoin && canJoin.reason !== 'User already has an active session at another table') {
    throw new ValidationError(canJoin.reason);
  }

  // End current session
  const currentSession = await TableSession.findOne({
    user: userId,
    isActive: true
  });

  if (currentSession) {
    currentSession.isActive = false;
    currentSession.leftAt = new Date();
    await currentSession.save();

    // Emit user left event
    emitUserLeftTable({
      tableId: currentSession.table.toString(),
      userId
    });
  }

  // Get new table
  const newTable = await Table.findById(newTableId);
  if (!newTable) {
    throw new NotFoundError('New table not found');
  }

  // Find or create bill for new table
  let bill = await Bill.findOne({
    table: newTableId,
    status: { $in: [BILL_STATUS.OPEN, BILL_STATUS.REQUESTING_PAYMENT] }
  });

  if (!bill) {
    bill = await Bill.create({
      table: newTableId,
      billNumber: generateBillNumber(),
      guestCount: 1,
      status: BILL_STATUS.OPEN,
      openedAt: new Date()
    });
  } else {
    bill.guestCount += 1;
    await bill.save();
  }

  // Create new session
  const newSession = await TableSession.create({
    user: userId,
    table: newTableId,
    bill: bill._id,
    joinedAt: new Date(),
    isActive: true
  });

  // Update table status if needed
  if (newTable.status === TABLE_STATUS.AVAILABLE) {
    newTable.status = TABLE_STATUS.OCCUPIED;
    await newTable.save();
    emitTableStatusChanged(newTable);
  }

  // Emit user joined event
  emitUserJoinedTable({
    tableId: newTableId,
    userId,
    userName: 'User'
  });

  return {
    message: 'User transferred successfully',
    previousTable: currentSession?.table,
    newTable: formatTable(newTable),
    session: formatSession(newSession),
    bill: formatBill(bill)
  };
};

module.exports = {
  getTables,
  getTableMap,
  getTableById,
  joinTable,
  leaveTable,
  generateQRCode,
  updateTableStatus,
  createTable,
  updateTable,
  mergeTables,
  unmergeTables,
  getUserActiveSession,
  formatTable,
  formatBill,
  // Multi-user functions
  getTableSessionUsers,
  getTableCombinedBill,
  canUserJoinTable,
  transferUserToTable
};
