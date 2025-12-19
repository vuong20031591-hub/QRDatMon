/**
 * OTP Audit Service
 * Handles audit logging for OTP operations
 * Requirements: 5.4, 5.5
 * 
 * Security Notes:
 * - NEVER log plaintext OTP values
 * - Always mask phone numbers in logs
 * - Log all OTP requests for audit purposes
 */

const { maskPhone } = require('./sms.service');

// OTP Audit Actions
const OTP_AUDIT_ACTIONS = {
  SEND_OTP: 'send_otp',
  VERIFY_OTP: 'verify_otp',
  RESEND_OTP: 'resend_otp',
  VERIFY_SUCCESS: 'verify_success',
  VERIFY_FAILED: 'verify_failed',
  RATE_LIMITED: 'rate_limited',
  LOCKOUT: 'lockout',
  COOLDOWN: 'cooldown'
};

// OTP Audit Status
const OTP_AUDIT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  BLOCKED: 'blocked'
};

/**
 * Format audit log entry
 * @param {Object} data - Audit data
 * @returns {Object} Formatted log entry
 */
const formatAuditEntry = (data) => {
  const {
    action,
    phone,
    status,
    ipAddress,
    userAgent,
    details,
    userId
  } = data;

  return {
    timestamp: new Date().toISOString(),
    action,
    phone: maskPhone(phone), // Always mask phone
    status,
    ipAddress: ipAddress || null,
    userAgent: userAgent ? userAgent.substring(0, 100) : null, // Truncate user agent
    userId: userId || null,
    details: sanitizeDetails(details)
  };
};

/**
 * Sanitize details object to remove sensitive data
 * @param {Object} details - Details object
 * @returns {Object} Sanitized details
 */
const sanitizeDetails = (details) => {
  if (!details) return null;

  const sanitized = { ...details };

  // Remove any potential OTP values
  const sensitiveKeys = ['otp', 'otpCode', 'code', 'otpHash', 'hash', 'password', 'token'];
  sensitiveKeys.forEach(key => {
    if (sanitized[key]) {
      delete sanitized[key];
    }
  });

  // Mask any phone numbers in details
  if (sanitized.phone) {
    sanitized.phone = maskPhone(sanitized.phone);
  }

  return sanitized;
};

/**
 * Log OTP audit event
 * @param {Object} data - Audit data
 */
const logOtpAudit = (data) => {
  const entry = formatAuditEntry(data);
  
  // Format log message
  const logMessage = `[OTP-AUDIT] ${entry.action} | Phone: ${entry.phone} | Status: ${entry.status} | IP: ${entry.ipAddress || 'N/A'}`;
  
  // Log based on status
  if (entry.status === OTP_AUDIT_STATUS.SUCCESS) {
    console.log(logMessage);
  } else if (entry.status === OTP_AUDIT_STATUS.BLOCKED) {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }

  // Log full entry as JSON for structured logging (can be parsed by log aggregators)
  console.log(`[OTP-AUDIT-JSON] ${JSON.stringify(entry)}`);
};

/**
 * Log send OTP request
 * @param {string} phone - Phone number
 * @param {boolean} success - Whether send was successful
 * @param {Object} options - Additional options
 */
const logSendOtp = (phone, success, options = {}) => {
  logOtpAudit({
    action: OTP_AUDIT_ACTIONS.SEND_OTP,
    phone,
    status: success ? OTP_AUDIT_STATUS.SUCCESS : OTP_AUDIT_STATUS.FAILED,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: options.details
  });
};

/**
 * Log verify OTP request
 * @param {string} phone - Phone number
 * @param {boolean} success - Whether verification was successful
 * @param {Object} options - Additional options
 */
const logVerifyOtp = (phone, success, options = {}) => {
  logOtpAudit({
    action: success ? OTP_AUDIT_ACTIONS.VERIFY_SUCCESS : OTP_AUDIT_ACTIONS.VERIFY_FAILED,
    phone,
    status: success ? OTP_AUDIT_STATUS.SUCCESS : OTP_AUDIT_STATUS.FAILED,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    userId: options.userId,
    details: options.details
  });
};

/**
 * Log resend OTP request
 * @param {string} phone - Phone number
 * @param {boolean} success - Whether resend was successful
 * @param {Object} options - Additional options
 */
const logResendOtp = (phone, success, options = {}) => {
  logOtpAudit({
    action: OTP_AUDIT_ACTIONS.RESEND_OTP,
    phone,
    status: success ? OTP_AUDIT_STATUS.SUCCESS : OTP_AUDIT_STATUS.FAILED,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: options.details
  });
};

/**
 * Log rate limit event
 * @param {string} phone - Phone number
 * @param {number} waitTime - Wait time in seconds
 * @param {Object} options - Additional options
 */
const logRateLimited = (phone, waitTime, options = {}) => {
  logOtpAudit({
    action: OTP_AUDIT_ACTIONS.RATE_LIMITED,
    phone,
    status: OTP_AUDIT_STATUS.BLOCKED,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: { waitTimeSeconds: waitTime }
  });
};

/**
 * Log lockout event
 * @param {string} phone - Phone number
 * @param {Date} unlockTime - When the lockout expires
 * @param {Object} options - Additional options
 */
const logLockout = (phone, unlockTime, options = {}) => {
  logOtpAudit({
    action: OTP_AUDIT_ACTIONS.LOCKOUT,
    phone,
    status: OTP_AUDIT_STATUS.BLOCKED,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: { unlockTime: unlockTime?.toISOString() }
  });
};

/**
 * Log cooldown event
 * @param {string} phone - Phone number
 * @param {number} waitTime - Wait time in seconds
 * @param {Object} options - Additional options
 */
const logCooldown = (phone, waitTime, options = {}) => {
  logOtpAudit({
    action: OTP_AUDIT_ACTIONS.COOLDOWN,
    phone,
    status: OTP_AUDIT_STATUS.BLOCKED,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    details: { waitTimeSeconds: waitTime }
  });
};

/**
 * Get client info from request object
 * @param {Object} req - Express request object
 * @returns {Object} Client info
 */
const getClientInfo = (req) => {
  if (!req) return {};

  return {
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      null,
    userAgent: req.headers['user-agent'] || null
  };
};

module.exports = {
  // Actions and Status constants
  OTP_AUDIT_ACTIONS,
  OTP_AUDIT_STATUS,
  
  // Logging functions
  logOtpAudit,
  logSendOtp,
  logVerifyOtp,
  logResendOtp,
  logRateLimited,
  logLockout,
  logCooldown,
  
  // Utility functions
  getClientInfo,
  formatAuditEntry,
  sanitizeDetails
};
