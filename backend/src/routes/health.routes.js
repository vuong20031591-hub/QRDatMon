/**
 * Health Check Routes
 * Provides health and version endpoints for monitoring
 * Requirements: 28.1, 28.2, 28.3
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const config = require('../config');

const API_VERSION = '1.0.0';
const BUILD_DATE = new Date().toISOString();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check with database status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready
 *       503:
 *         description: Server is not ready
 */
router.get('/ready', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const isReady = dbState === 1;

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    status: isReady ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStates[dbState] || 'unknown',
        ready: isReady
      }
    }
  });
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is alive
 */
router.get('/live', (req, res) => {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Get API version and available endpoints
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API version info
 */
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: API_VERSION,
    buildDate: BUILD_DATE,
    environment: config.server.env,
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      menu: '/api/menu',
      tables: '/api/tables',
      cart: '/api/cart',
      orders: '/api/orders',
      bills: '/api/bills',
      payments: '/api/payments',
      promotions: '/api/promotions',
      reviews: '/api/reviews',
      inventory: '/api/inventory',
      staff: '/api/staff',
      notifications: '/api/notifications',
      reports: '/api/reports',
      activityLogs: '/api/activity-logs',
      incidents: '/api/incidents',
      upload: '/api/upload',
      docs: '/api/docs'
    }
  });
});

module.exports = router;
