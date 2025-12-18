/**
 * Route Aggregator
 * Combines all API routes and exports a single router
 * This file serves as the central hub for all API endpoints
 */

const express = require("express");
const swaggerUi = require('swagger-ui-express');
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const menuRoutes = require("./menu.routes");
const categoryRoutes = require("./category.routes");
const tableRoutes = require("./table.routes");
const areaRoutes = require("./area.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const billRoutes = require("./bill.routes");
const paymentRoutes = require("./payment.routes");
const promotionRoutes = require("./promotion.routes");
const reviewRoutes = require('./review.routes');
const inventoryRoutes = require('./inventory.routes');
const staffRoutes = require('./staff.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const activityLogRoutes = require('./activityLog.routes');
const incidentRoutes = require('./incident.routes');
const settingRoutes = require('./setting.routes');
const healthRoutes = require('./health.routes');
const uploadRoutes = require('./upload.routes');
const imageRoutes = require('./image.routes');
const swaggerSpec = require('../config/swagger');

// API versioning info
const API_VERSION = "1.0.0";

/**
 * @route   GET /api
 * @desc    API info and health check
 * @access  Public
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "QRDatMon API",
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      menu: "/api/menu",
      tables: "/api/tables",
      areas: "/api/areas",
      cart: "/api/cart",
      orders: "/api/orders",
      bills: "/api/bills",
      payments: "/api/payments",
      promotions: "/api/promotions",
      reviews: "/api/reviews",
      inventory: "/api/inventory",
      staff: "/api/staff",
      notifications: "/api/notifications",
      reports: "/api/reports",
      activityLogs: "/api/activity-logs",
      incidents: "/api/incidents",
      settings: "/api/settings",
      health: "/api/health",
      upload: "/api/upload",
      images: "/api/images",
      docs: "/api/docs",
    },
  });
});

// Mount route modules
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/menu", menuRoutes);
router.use("/tables", tableRoutes);
router.use("/areas", areaRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/bills", billRoutes);
router.use("/payments", paymentRoutes);
router.use("/promotions", promotionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/staff', staffRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/incidents', incidentRoutes);
router.use('/settings', settingRoutes);
router.use('/health', healthRoutes);
router.use('/upload', uploadRoutes);
router.use('/images', imageRoutes);

// Swagger API Documentation
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

module.exports = router;
