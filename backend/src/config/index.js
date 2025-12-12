/**
 * Application Configuration
 * Loads environment variables and exports configuration object
 * Requirements: 20.1, 20.2
 */

require("dotenv").config();

const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || "development",
    apiPrefix: process.env.API_PREFIX || "/api",
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:8080"],
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/qrdatmon",
    options: {
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },

  // JWT configuration
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    accessTokenExpiry:
      process.env.JWT_ACCESS_EXPIRY || process.env.JWT_EXPIRES_IN || "1h",
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    issuer: process.env.JWT_ISSUER || "qrdatmon-api",
    audience: process.env.JWT_AUDIENCE || "qrdatmon-clients",
  },

  // Session configuration
  session: {
    guestTokenExpiry: process.env.GUEST_TOKEN_EXPIRY || "24h",
    qrTokenExpiry: process.env.QR_TOKEN_EXPIRY || "12h",
  },

  // Rate limiting configuration
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== "false",
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    uploadDir: process.env.UPLOAD_DIR || "uploads",
  },

  // VietQR configuration (for payment)
  vietqr: {
    clientId: process.env.VIETQR_CLIENT_ID,
    apiKey: process.env.VIETQR_API_KEY,
    bankCode: process.env.VIETQR_BANK_CODE,
    accountNo: process.env.VIETQR_ACCOUNT_NUMBER,
    accountName: process.env.VIETQR_ACCOUNT_NAME,
    template: process.env.VIETQR_TEMPLATE || "compact2",
  },

  // Restaurant settings defaults
  restaurant: {
    name: process.env.RESTAURANT_NAME || "QR Đặt Món",
    serviceChargePercent: parseFloat(process.env.SERVICE_CHARGE_PERCENT) || 0,
    vatPercent: parseFloat(process.env.VAT_PERCENT) || 10,
    currency: process.env.CURRENCY || "VND",
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "dev",
  },
};

// Validate required configuration in production
const validateConfig = () => {
  const requiredInProduction = [
    { key: "database.uri", value: config.database.uri },
    { key: "jwt.secret", value: config.jwt.secret },
  ];

  // Firebase is optional - only validate if any Firebase config is provided
  const hasFirebaseConfig =
    config.firebase.projectId ||
    config.firebase.clientEmail ||
    config.firebase.privateKey;

  if (hasFirebaseConfig) {
    requiredInProduction.push(
      { key: "firebase.projectId", value: config.firebase.projectId },
      { key: "firebase.clientEmail", value: config.firebase.clientEmail },
      { key: "firebase.privateKey", value: config.firebase.privateKey },
    );
  }

  if (config.server.env === "production") {
    const missing = requiredInProduction
      .filter((item) => !item.value)
      .map((item) => item.key);

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration in production: ${missing.join(", ")}`,
      );
    }

    // Ensure JWT secret is not default in production
    if (
      config.jwt.secret === "your-super-secret-jwt-key-change-in-production"
    ) {
      throw new Error(
        "JWT_SECRET must be changed from default value in production",
      );
    }
  }
};

// Helper to check if running in development
const isDevelopment = () => config.server.env === "development";

// Helper to check if running in production
const isProduction = () => config.server.env === "production";

// Helper to check if running in test
const isTest = () => config.server.env === "test";

module.exports = {
  ...config,
  validateConfig,
  isDevelopment,
  isProduction,
  isTest,
};
