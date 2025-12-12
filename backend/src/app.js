/**
 * QRDatMon Backend API
 * Main Express Application Entry Point
 *
 * This file sets up the Express application with all middleware,
 * routes, and error handling.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");

// Import configuration
const config = require("./config");

// Import database connection
const { connectDB } = require("./database");

// Import middleware
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");

// Import routes
const apiRoutes = require("./routes");

// Initialize Express app
const app = express();

// Trust proxy (required for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// ============================================
// Global Middleware
// ============================================

// CORS configuration
app.use(
  cors({
    origin: config.server.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Request logging
if (config.server.env !== "test") {
  app.use(morgan(config.logging.format));
}

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply general rate limiter to all requests
if (config.rateLimit.enabled) {
  app.use(generalLimiter);
}

// ============================================
// Health Check Endpoints
// ============================================

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.server.env,
  });
});

/**
 * @route   GET /health/ready
 * @desc    Readiness check (includes DB connection status)
 * @access  Public
 */
app.get("/health/ready", async (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const isReady = dbState === 1;

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    status: isReady ? "ready" : "not ready",
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStates[dbState] || "unknown",
        ready: isReady,
      },
    },
  });
});

// ============================================
// API Routes
// ============================================

// Mount API routes under /api prefix
app.use("/api", apiRoutes);

// ============================================
// Error Handling
// ============================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const PORT = config.server.port;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Validate configuration (throws error in production if missing required config)
    if (config.server.env === "production") {
      config.validateConfig();
    }

    // Connect to MongoDB
    await connectDB();
    console.log("✅ Database connected");

    // Initialize Firebase (if configured)
    const firebase = require("./config/firebase");
    if (firebase.isInitialized()) {
      console.log("✅ Firebase initialized");
    } else {
      console.warn("⚠️  Firebase not configured - Google auth will not work");
    }

    // Create HTTP server
    const server = http.createServer(app);

    // TODO: Initialize Socket.io for real-time features
    // const io = require('socket.io')(server, {
    //   cors: {
    //     origin: config.server.corsOrigins,
    //     credentials: true
    //   }
    // });
    // require('./socket')(io);

    // Start listening
    server.listen(PORT, () => {
      console.log("");
      console.log("🚀 QRDatMon API Server Started");
      console.log("================================");
      console.log(`📍 Environment: ${config.server.env}`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`📍 Health Check: http://localhost:${PORT}/health`);
      console.log("================================");
      console.log("");
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed");

        // Close database connection
        const { disconnectDB } = require("./database");
        await disconnectDB();
        console.log("Database connection closed");

        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error(
          "Could not close connections in time, forcefully shutting down",
        );
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = { app, startServer };
