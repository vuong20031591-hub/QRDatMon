/**
 * Socket.io Server Setup
 * Handles real-time communication for orders, tables, and notifications
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');

let io = null;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io server instance
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.server.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        // Allow guest connections with limited access
        socket.user = { role: 'guest', isAuthenticated: false };
        return next();
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = { ...decoded, isAuthenticated: true };
      next();
    } catch (error) {
      // Allow connection but mark as unauthenticated
      socket.user = { role: 'guest', isAuthenticated: false };
      next();
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user?.role || 'guest'})`);

    // Join user-specific room if authenticated
    if (socket.user?.isAuthenticated && socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`);
    }

    // Join table room
    socket.on('join:table', (tableId) => {
      if (tableId) {
        socket.join(`table:${tableId}`);
        console.log(`Socket ${socket.id} joined table:${tableId}`);
      }
    });

    // Leave table room
    socket.on('leave:table', (tableId) => {
      if (tableId) {
        socket.leave(`table:${tableId}`);
        console.log(`Socket ${socket.id} left table:${tableId}`);
      }
    });

    // Join kitchen room (staff only)
    socket.on('join:kitchen', () => {
      if (socket.user?.isAuthenticated && ['kitchen', 'manager', 'admin'].includes(socket.user?.role)) {
        socket.join('kitchen');
        console.log(`Socket ${socket.id} joined kitchen`);
      }
    });

    // Join staff room
    socket.on('join:staff', () => {
      if (socket.user?.isAuthenticated && socket.user?.role !== 'customer') {
        socket.join('staff');
        console.log(`Socket ${socket.id} joined staff`);
      }
    });

    // Join admin room
    socket.on('join:admin', () => {
      if (socket.user?.isAuthenticated && ['manager', 'admin'].includes(socket.user?.role)) {
        socket.join('admin');
        console.log(`Socket ${socket.id} joined admin`);
      }
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Check if Socket.io is initialized
 * @returns {boolean}
 */
const isInitialized = () => !!io;

module.exports = {
  initializeSocket,
  getIO,
  isInitialized
};
