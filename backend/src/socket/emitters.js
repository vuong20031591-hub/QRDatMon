/**
 * Socket Event Emitters
 * Centralized functions for emitting real-time events
 * Requirements: 8.2, 8.3, 8.4, 2.7
 */

const { getIO, isInitialized } = require('./index');

/**
 * Safely emit event (no-op if socket not initialized)
 * @param {Function} emitFn - Emit function to execute
 */
const safeEmit = (emitFn) => {
  if (!isInitialized()) {
    return;
  }
  try {
    emitFn(getIO());
  } catch (error) {
    console.error('Socket emit error:', error.message);
  }
};

// ============================================
// Order Events
// ============================================

/**
 * Emit new order created event
 * @param {Object} order - Order data
 */
const emitOrderCreated = (order) => {
  safeEmit((io) => {
    // Notify kitchen
    io.to('kitchen').emit('order:created', {
      type: 'ORDER_CREATED',
      data: order,
      timestamp: new Date().toISOString()
    });

    // Notify staff
    io.to('staff').emit('order:created', {
      type: 'ORDER_CREATED',
      data: order,
      timestamp: new Date().toISOString()
    });

    // Notify table
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:created', {
        type: 'ORDER_CREATED',
        data: order,
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * Emit order status updated event
 * @param {Object} order - Order data with new status
 */
const emitOrderStatusUpdated = (order) => {
  safeEmit((io) => {
    const event = {
      type: 'ORDER_STATUS_UPDATED',
      data: {
        orderId: order._id || order.id,
        status: order.status,
        updatedAt: order.updatedAt
      },
      timestamp: new Date().toISOString()
    };

    // Notify customer who placed the order
    if (order.user) {
      io.to(`user:${order.user}`).emit('order:updated', event);
    }

    // Notify table
    if (order.table) {
      io.to(`table:${order.table}`).emit('order:updated', event);
    }

    // Notify kitchen and staff
    io.to('kitchen').emit('order:updated', event);
    io.to('staff').emit('order:updated', event);
  });
};

/**
 * Emit order item status updated event
 * @param {Object} data - { orderId, itemId, status, itemName }
 */
const emitOrderItemStatusUpdated = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'ORDER_ITEM_STATUS_UPDATED',
      data,
      timestamp: new Date().toISOString()
    };

    io.to('kitchen').emit('order:item-updated', event);
    io.to('staff').emit('order:item-updated', event);

    if (data.tableId) {
      io.to(`table:${data.tableId}`).emit('order:item-updated', event);
    }
  });
};

/**
 * Emit order ready for serving
 * @param {Object} order - Order data
 */
const emitOrderReady = (order) => {
  safeEmit((io) => {
    const event = {
      type: 'ORDER_READY',
      data: order,
      timestamp: new Date().toISOString()
    };

    io.to('staff').emit('order:ready', event);

    if (order.table) {
      io.to(`table:${order.table}`).emit('order:ready', event);
    }

    if (order.user) {
      io.to(`user:${order.user}`).emit('order:ready', event);
    }
  });
};

/**
 * Emit order cancelled event
 * @param {Object} data - { orderId, reason, cancelledBy }
 */
const emitOrderCancelled = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'ORDER_CANCELLED',
      data,
      timestamp: new Date().toISOString()
    };

    io.to('kitchen').emit('order:cancelled', event);
    io.to('staff').emit('order:cancelled', event);

    if (data.tableId) {
      io.to(`table:${data.tableId}`).emit('order:cancelled', event);
    }
  });
};

// ============================================
// Table Events
// ============================================

/**
 * Emit table status changed event
 * @param {Object} table - Table data with new status
 */
const emitTableStatusChanged = (table) => {
  safeEmit((io) => {
    const eventData = {
      type: 'TABLE_STATUS_CHANGED',
      data: {
        tableId: table._id || table.id,
        tableNumber: table.tableNumber,
        status: table.status,
        area: table.area?._id || table.area
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('[SOCKET] Emitting table:status-changed to staff room:', eventData);
    
    io.to('staff').emit('table:status-changed', eventData);
  });
};

/**
 * Emit user joined table event
 * @param {Object} data - { tableId, userId, userName }
 */
const emitUserJoinedTable = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'USER_JOINED_TABLE',
      data,
      timestamp: new Date().toISOString()
    };
    
    // Notify table room
    io.to(`table:${data.tableId}`).emit('table:user-joined', event);
    
    // Notify staff room for real-time updates on web admin
    io.to('staff').emit('table:user-joined', event);
  });
};

/**
 * Emit user left table event
 * @param {Object} data - { tableId, userId }
 */
const emitUserLeftTable = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'USER_LEFT_TABLE',
      data,
      timestamp: new Date().toISOString()
    };
    
    // Notify table room
    io.to(`table:${data.tableId}`).emit('table:user-left', event);
    
    // Notify staff room for real-time updates on web admin
    io.to('staff').emit('table:user-left', event);
  });
};

// ============================================
// Menu Events
// ============================================

/**
 * Emit menu item status changed event
 * @param {Object} menuItem - Menu item data
 */
const emitMenuItemStatusChanged = (menuItem) => {
  safeEmit((io) => {
    io.emit('menu:item-updated', {
      type: 'MENU_ITEM_STATUS_CHANGED',
      data: {
        itemId: menuItem._id || menuItem.id,
        name: menuItem.name,
        status: menuItem.status
      },
      timestamp: new Date().toISOString()
    });
  });
};

// ============================================
// Bill & Payment Events
// ============================================

/**
 * Emit bill updated event
 * @param {Object} bill - Bill data
 */
const emitBillUpdated = (bill) => {
  safeEmit((io) => {
    const event = {
      type: 'BILL_UPDATED',
      data: bill,
      timestamp: new Date().toISOString()
    };

    if (bill.table) {
      io.to(`table:${bill.table}`).emit('bill:updated', event);
    }

    io.to('staff').emit('bill:updated', event);
  });
};

/**
 * Emit payment received event
 * @param {Object} data - Payment data
 */
const emitPaymentReceived = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'PAYMENT_RECEIVED',
      data,
      timestamp: new Date().toISOString()
    };

    io.to('staff').emit('payment:received', event);
    io.to('admin').emit('payment:received', event);

    if (data.tableId) {
      io.to(`table:${data.tableId}`).emit('payment:received', event);
    }
  });
};

// ============================================
// Notification Events
// ============================================

/**
 * Emit notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
const emitNotificationToUser = (userId, notification) => {
  safeEmit((io) => {
    io.to(`user:${userId}`).emit('notification', {
      type: 'NOTIFICATION',
      data: notification,
      timestamp: new Date().toISOString()
    });
  });
};

/**
 * Emit low stock alert
 * @param {Object} data - { itemId, itemName, currentStock, minThreshold }
 */
const emitLowStockAlert = (data) => {
  safeEmit((io) => {
    io.to('admin').emit('inventory:low-stock', {
      type: 'LOW_STOCK_ALERT',
      data,
      timestamp: new Date().toISOString()
    });
  });
};

// ============================================
// Incident Events
// ============================================

/**
 * Emit incident created event
 * @param {Object} data - { incidentId, type, orderNumber, itemName, reportedBy }
 */
const emitIncidentCreated = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'INCIDENT_CREATED',
      data,
      timestamp: new Date().toISOString()
    };

    // Notify managers and admin
    io.to('admin').emit('incident:created', event);
    io.to('staff').emit('incident:created', event);
  });
};

/**
 * Emit incident resolved event
 * @param {Object} data - { incidentId, resolvedBy }
 */
const emitIncidentResolved = (data) => {
  safeEmit((io) => {
    const event = {
      type: 'INCIDENT_RESOLVED',
      data,
      timestamp: new Date().toISOString()
    };

    io.to('admin').emit('incident:resolved', event);
    io.to('staff').emit('incident:resolved', event);
  });
};

module.exports = {
  // Order events
  emitOrderCreated,
  emitOrderStatusUpdated,
  emitOrderItemStatusUpdated,
  emitOrderReady,
  emitOrderCancelled,
  // Table events
  emitTableStatusChanged,
  emitUserJoinedTable,
  emitUserLeftTable,
  // Menu events
  emitMenuItemStatusChanged,
  // Bill & Payment events
  emitBillUpdated,
  emitPaymentReceived,
  // Notification events
  emitNotificationToUser,
  emitLowStockAlert,
  // Incident events
  emitIncidentCreated,
  emitIncidentResolved
};
