/**
 * Route Aggregator
 * Combines all API routes and exports a single router
 * This file serves as the central hub for all API endpoints
 */

const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const menuRoutes = require("./menu.routes");
const categoryRoutes = require("./category.routes");
const tableRoutes = require("./table.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const billRoutes = require("./bill.routes");
const paymentRoutes = require("./payment.routes");
const promotionRoutes = require("./promotion.routes");
const reviewRoutes = require('./review.routes');
const inventoryRoutes = require('./inventory.routes');
// const staffRoutes = require('./staff.routes');
// const reportRoutes = require('./report.routes');
// const adminRoutes = require('./admin.routes');

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
      cart: "/api/cart",
      orders: "/api/orders",
      bills: "/api/bills",
      payments: "/api/payments",
      promotions: "/api/promotions",
      reviews: "/api/reviews",
      inventory: "/api/inventory",
      staff: "/api/staff",
      reports: "/api/reports",
    },
  });
});

// Mount route modules
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/menu", menuRoutes);
router.use("/tables", tableRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/bills", billRoutes);
router.use("/payments", paymentRoutes);
router.use("/promotions", promotionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/inventory', inventoryRoutes);
// router.use('/staff', staffRoutes);
// router.use('/reports', reportRoutes);
// router.use('/admin', adminRoutes);

module.exports = router;
