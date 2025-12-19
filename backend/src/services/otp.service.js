/**
 * OTP Service
 * Handles OTP generation, verification, and management for phone authentication
 * Requirements: 1.1, 1.4, 1.6, 1.7, 2.1, 2.4, 2.6, 3.1, 3.3, 3.4, 5.1, 5.2
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');
const { User } = require('../models');
const { sendSms, formatOtpMessage, maskPhone } = require('./sms.service');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const { AUTH_PROVIDER } = require('../utils/constants');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const {
  logSendOtp,
  logVerifyOtp,
  logResendOtp,
  logRateLimited,
  logLockout,
  logCooldown
} = require('./otp-audit.service');

// OTP Configuration (based on design document)
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 3,                    // Requirement 2.6: Max 3 verification attempts
  cooldownSeconds: 45,               // Requirement 3.3: 45 seconds cooldown
  maxCooldownSeconds: 120,           // Max cooldown with exponential backoff
  rateLimit: {
    maxRequests: 5,                  // Design: 5 requests per window
    windowMinutes: 15                // Design: 15 minute window
  },
  lockout: {
    maxFailedAttempts: 10,           // Design: 10 failed attempts
    lockoutHours: 2                  // Design: 2 hour lockout (changed from 1 hour in design)
  }
};

// In-memory rate limit store (should use Redis in production)
const rateLimitStore = new Map();
const lockoutStore = new Map();

/**
 * Normalize phone number to E.164 format (+84xxxxxxxxx)
 * @param {string} phone - Phone number in various formats
 * @returns {string} Normalized phone number
 */
const normalizePhone = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Handle Vietnamese phone formats
  if (cleaned.startsWith('+84')) {
    // Already in E.164 format
    return cleaned;
  } else if (cleaned.startsWith('84')) {
    // Missing + prefix
    return '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    // Local format (0xxxxxxxxx)
    return '+84' + cleaned.substring(1);
  }
  
  // Assume it's already without country code
  return '+84' + cleaned;
};

/**
 * Validate Vietnamese phone number format
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, error?: string}}
 */
const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, error: 'Số điện thoại không được để trống' };
  }

  // Normalize first
  const normalized = normalizePhone(phone);
  
  // Vietnamese phone: +84 followed by 9 digits (total 12 chars)
  // Valid prefixes after +84: 3, 5, 7, 8, 9 (mobile carriers)
  const phoneRegex = /^\+84[35789]\d{8}$/;
  
  if (!phoneRegex.test(normalized)) {
    return { 
      valid: false, 
      error: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 0)' 
    };
  }

  return { valid: true };
};

/**
 * Generate cryptographically secure 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOtp = () => {
  // Use crypto.randomInt for cryptographically secure random number
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString().padStart(OTP_CONFIG.length, '0');
};

/**
 * Hash OTP using bcrypt
 * @param {string} otp - Plain OTP code
 * @returns {Promise<string>} Hashed OTP
 */
const hashOtp = async (otp) => {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
};

/**
 * Verify OTP against hash
 * @param {string} otp - Plain OTP code
 * @param {string} hash - Hashed OTP
 * @returns {Promise<boolean>} True if OTP matches
 */
const verifyOtpHash = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

/**
 * Check rate limit for phone number
 * @param {string} phone - Normalized phone number
 * @returns {{allowed: boolean, waitTime?: number}}
 */
const checkRateLimit = (phone) => {
  const now = Date.now();
  const windowMs = OTP_CONFIG.rateLimit.windowMinutes * 60 * 1000;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(phone);
  
  if (!entry) {
    entry = { requests: [], windowStart: now };
    rateLimitStore.set(phone, entry);
  }
  
  // Clean old requests outside window
  entry.requests = entry.requests.filter(time => now - time < windowMs);
  
  if (entry.requests.length >= OTP_CONFIG.rateLimit.maxRequests) {
    const oldestRequest = entry.requests[0];
    const waitTime = Math.ceil((oldestRequest + windowMs - now) / 1000);
    return { allowed: false, waitTime };
  }
  
  return { allowed: true };
};

/**
 * Record rate limit request
 * @param {string} phone - Normalized phone number
 */
const recordRateLimitRequest = (phone) => {
  const entry = rateLimitStore.get(phone) || { requests: [] };
  entry.requests.push(Date.now());
  rateLimitStore.set(phone, entry);
};

/**
 * Check if phone is locked out due to too many failed attempts
 * @param {string} phone - Normalized phone number
 * @returns {{locked: boolean, unlockTime?: Date}}
 */
const checkLockout = (phone) => {
  const lockout = lockoutStore.get(phone);
  
  if (!lockout) {
    return { locked: false };
  }
  
  const now = Date.now();
  if (now < lockout.unlockTime) {
    return { 
      locked: true, 
      unlockTime: new Date(lockout.unlockTime) 
    };
  }
  
  // Lockout expired, remove it
  lockoutStore.delete(phone);
  return { locked: false };
};

/**
 * Record failed attempt and check for lockout
 * @param {string} phone - Normalized phone number
 */
const recordFailedAttempt = (phone) => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window
  
  let entry = lockoutStore.get(phone);
  
  if (!entry || now - entry.windowStart > windowMs) {
    entry = { failedAttempts: 0, windowStart: now };
  }
  
  entry.failedAttempts++;
  
  if (entry.failedAttempts >= OTP_CONFIG.lockout.maxFailedAttempts) {
    entry.unlockTime = now + (OTP_CONFIG.lockout.lockoutHours * 60 * 60 * 1000);
    // Lockout will be logged by the calling function via logLockout
  }
  
  lockoutStore.set(phone, entry);
};

/**
 * Clear lockout for phone (after successful verification)
 * @param {string} phone - Normalized phone number
 */
const clearLockout = (phone) => {
  lockoutStore.delete(phone);
};

/**
 * Calculate cooldown with exponential backoff
 * @param {number} attemptCount - Number of OTP requests
 * @returns {number} Cooldown in seconds
 */
const calculateCooldown = (attemptCount) => {
  // Base cooldown: 30s, doubles each time, max 120s
  const cooldown = Math.min(
    OTP_CONFIG.cooldownSeconds * Math.pow(2, attemptCount - 1),
    OTP_CONFIG.maxCooldownSeconds
  );
  return cooldown;
};

/**
 * Check if can resend OTP (cooldown check)
 * @param {string} phone - Phone number
 * @returns {Promise<{canResend: boolean, waitTime?: number, attemptCount?: number}>}
 */
const canResendOtp = async (phone) => {
  const normalizedPhone = normalizePhone(phone);
  
  // Check lockout first
  const lockoutStatus = checkLockout(normalizedPhone);
  if (lockoutStatus.locked) {
    const waitTime = Math.ceil((lockoutStatus.unlockTime.getTime() - Date.now()) / 1000);
    return { canResend: false, waitTime, reason: 'LOCKED' };
  }
  
  // Check rate limit
  const rateLimitStatus = checkRateLimit(normalizedPhone);
  if (!rateLimitStatus.allowed) {
    return { canResend: false, waitTime: rateLimitStatus.waitTime, reason: 'RATE_LIMITED' };
  }
  
  // Check cooldown from last OTP
  const lastOtp = await Otp.findOne({ phone: normalizedPhone })
    .sort({ lastSentAt: -1 });
  
  if (lastOtp) {
    const now = Date.now();
    const lastSent = lastOtp.lastSentAt.getTime();
    
    // Count recent OTPs for exponential backoff
    const recentOtps = await Otp.countDocuments({
      phone: normalizedPhone,
      createdAt: { $gte: new Date(now - 15 * 60 * 1000) } // Last 15 minutes
    });
    
    const cooldown = calculateCooldown(recentOtps);
    const cooldownMs = cooldown * 1000;
    
    if (now - lastSent < cooldownMs) {
      const waitTime = Math.ceil((lastSent + cooldownMs - now) / 1000);
      return { canResend: false, waitTime, attemptCount: recentOtps };
    }
  }
  
  return { canResend: true };
};

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number
 * @param {Object} clientInfo - Client info for audit logging (ipAddress, userAgent)
 * @returns {Promise<{success: boolean, message: string, cooldownSeconds?: number}>}
 */
const sendOtp = async (phone, clientInfo = {}) => {
  // Validate phone
  const validation = validatePhone(phone);
  if (!validation.valid) {
    // Log failed validation attempt
    logSendOtp(phone, false, {
      ...clientInfo,
      details: { reason: 'invalid_phone', error: validation.error }
    });
    throw new ValidationError(validation.error);
  }
  
  const normalizedPhone = normalizePhone(phone);
  
  // Check lockout
  const lockoutStatus = checkLockout(normalizedPhone);
  if (lockoutStatus.locked) {
    const waitMinutes = Math.ceil((lockoutStatus.unlockTime.getTime() - Date.now()) / 60000);
    // Log lockout event
    logLockout(normalizedPhone, lockoutStatus.unlockTime, clientInfo);
    throw new AuthenticationError(
      `Số điện thoại tạm khóa. Vui lòng thử lại sau ${waitMinutes} phút`
    );
  }
  
  // Check rate limit
  const rateLimitStatus = checkRateLimit(normalizedPhone);
  if (!rateLimitStatus.allowed) {
    // Log rate limit event
    logRateLimited(normalizedPhone, rateLimitStatus.waitTime, clientInfo);
    throw new AuthenticationError(
      `Quá nhiều yêu cầu. Vui lòng đợi ${Math.ceil(rateLimitStatus.waitTime / 60)} phút`
    );
  }
  
  // Check cooldown
  const resendStatus = await canResendOtp(normalizedPhone);
  if (!resendStatus.canResend) {
    // Log cooldown event
    logCooldown(normalizedPhone, resendStatus.waitTime, clientInfo);
    return {
      success: false,
      message: `Vui lòng đợi ${resendStatus.waitTime} giây trước khi gửi lại`,
      cooldownSeconds: resendStatus.waitTime
    };
  }
  
  // Invalidate any existing OTP for this phone (Requirement 1.6)
  await Otp.updateMany(
    { phone: normalizedPhone, isUsed: false },
    { isUsed: true }
  );
  
  // Generate new OTP
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  
  // Calculate expiry time (5 minutes)
  const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);
  
  // Save OTP to database
  await Otp.create({
    phone: normalizedPhone,
    otpHash,
    expiresAt,
    lastSentAt: new Date()
  });
  
  // Record rate limit
  recordRateLimitRequest(normalizedPhone);
  
  // Send SMS
  const message = formatOtpMessage(otp);
  const smsResult = await sendSms(normalizedPhone, message);
  
  if (!smsResult.success) {
    // Log failed SMS send
    logSendOtp(normalizedPhone, false, {
      ...clientInfo,
      details: { reason: 'sms_failed' }
    });
    throw new Error('Không thể gửi OTP. Vui lòng thử lại');
  }
  
  // Log successful OTP send (Requirement 5.4)
  logSendOtp(normalizedPhone, true, clientInfo);
  
  // Calculate next cooldown for response
  const recentOtps = await Otp.countDocuments({
    phone: normalizedPhone,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });
  const nextCooldown = calculateCooldown(recentOtps);
  
  return {
    success: true,
    message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
    cooldownSeconds: nextCooldown
  };
};

/**
 * Verify OTP and authenticate user
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code to verify
 * @param {Object} clientInfo - Client info for audit logging (ipAddress, userAgent)
 * @returns {Promise<{valid: boolean, user?: Object, accessToken?: string, refreshToken?: string, error?: string}>}
 */
const verifyOtp = async (phone, otp, clientInfo = {}) => {
  // Validate inputs
  const validation = validatePhone(phone);
  if (!validation.valid) {
    // Log failed validation
    logVerifyOtp(phone, false, {
      ...clientInfo,
      details: { reason: 'invalid_phone', error: validation.error }
    });
    throw new ValidationError(validation.error);
  }
  
  if (!otp || otp.length !== OTP_CONFIG.length || !/^\d+$/.test(otp)) {
    // Log failed validation (don't log the OTP value!)
    logVerifyOtp(phone, false, {
      ...clientInfo,
      details: { reason: 'invalid_otp_format' }
    });
    throw new ValidationError('Mã OTP phải là 6 chữ số');
  }
  
  const normalizedPhone = normalizePhone(phone);
  
  // Check lockout
  const lockoutStatus = checkLockout(normalizedPhone);
  if (lockoutStatus.locked) {
    const waitMinutes = Math.ceil((lockoutStatus.unlockTime.getTime() - Date.now()) / 60000);
    // Log lockout event
    logLockout(normalizedPhone, lockoutStatus.unlockTime, clientInfo);
    throw new AuthenticationError(
      `Số điện thoại tạm khóa. Vui lòng thử lại sau ${waitMinutes} phút`
    );
  }
  
  // Find valid OTP
  const otpRecord = await Otp.findOne({
    phone: normalizedPhone,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
  
  if (!otpRecord) {
    recordFailedAttempt(normalizedPhone);
    // Log failed verification - OTP not found/expired
    logVerifyOtp(normalizedPhone, false, {
      ...clientInfo,
      details: { reason: 'otp_not_found_or_expired' }
    });
    return {
      valid: false,
      error: 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới'
    };
  }
  
  // Check max attempts (Requirement 2.6)
  if (otpRecord.attempts >= OTP_CONFIG.maxAttempts) {
    // Invalidate OTP
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    recordFailedAttempt(normalizedPhone);
    // Log max attempts exceeded
    logVerifyOtp(normalizedPhone, false, {
      ...clientInfo,
      details: { reason: 'max_attempts_exceeded', attempts: otpRecord.attempts }
    });
    return {
      valid: false,
      error: 'Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới'
    };
  }
  
  // Verify OTP hash
  const isValid = await verifyOtpHash(otp, otpRecord.otpHash);
  
  if (!isValid) {
    // Increment attempt counter (Requirement 2.4)
    otpRecord.attempts += 1;
    await otpRecord.save();
    
    recordFailedAttempt(normalizedPhone);
    
    const remainingAttempts = OTP_CONFIG.maxAttempts - otpRecord.attempts;
    // Log failed verification - wrong OTP (don't log the OTP value!)
    logVerifyOtp(normalizedPhone, false, {
      ...clientInfo,
      details: { reason: 'wrong_otp', attemptNumber: otpRecord.attempts, remainingAttempts }
    });
    return {
      valid: false,
      error: `Mã OTP không đúng. Còn ${remainingAttempts} lần thử`
    };
  }
  
  // OTP is valid - mark as used
  otpRecord.isUsed = true;
  await otpRecord.save();
  
  // Clear lockout on successful verification
  clearLockout(normalizedPhone);
  
  // Find or create user (Requirements 2.2, 2.7)
  let user = await User.findOne({ phone: normalizedPhone });
  let isNewUser = false;
  
  if (!user) {
    // Create new user with phone auth
    isNewUser = true;
    user = await User.create({
      phone: normalizedPhone,
      name: `User ${normalizedPhone.slice(-4)}`,
      authProvider: AUTH_PROVIDER.PHONE,
      isGuest: false,
      isActive: true
    });
  } else {
    // Update last login (Requirement 2.8)
    user.updatedAt = new Date();
    await user.save();
  }
  
  // Generate tokens (Requirement 2.3)
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Delete the used OTP record (AWS best practice)
  await Otp.deleteOne({ _id: otpRecord._id });
  
  // Log successful verification (Requirement 5.4)
  logVerifyOtp(normalizedPhone, true, {
    ...clientInfo,
    userId: user._id.toString(),
    details: { isNewUser }
  });
  
  return {
    valid: true,
    user: {
      id: user._id,
      phone: user.phone,
      name: user.name,
      email: user.email || null,
      avatarUrl: user.avatarUrl || null,
      authProvider: user.authProvider,
      isGuest: user.isGuest,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    accessToken,
    refreshToken,
    tokenType: 'Bearer'
  };
};

/**
 * Resend OTP to phone number
 * @param {string} phone - Phone number
 * @param {Object} clientInfo - Client info for audit logging (ipAddress, userAgent)
 * @returns {Promise<{success: boolean, message: string, cooldownSeconds?: number}>}
 */
const resendOtp = async (phone, clientInfo = {}) => {
  // Validate phone
  const validation = validatePhone(phone);
  if (!validation.valid) {
    // Log failed validation
    logResendOtp(phone, false, {
      ...clientInfo,
      details: { reason: 'invalid_phone', error: validation.error }
    });
    throw new ValidationError(validation.error);
  }
  
  const normalizedPhone = normalizePhone(phone);
  
  // Check if can resend
  const resendStatus = await canResendOtp(normalizedPhone);
  if (!resendStatus.canResend) {
    if (resendStatus.reason === 'LOCKED') {
      // Log lockout event
      logLockout(normalizedPhone, new Date(Date.now() + resendStatus.waitTime * 1000), clientInfo);
      throw new AuthenticationError(
        `Số điện thoại tạm khóa. Vui lòng thử lại sau ${Math.ceil(resendStatus.waitTime / 60)} phút`
      );
    }
    if (resendStatus.reason === 'RATE_LIMITED') {
      // Log rate limit event
      logRateLimited(normalizedPhone, resendStatus.waitTime, clientInfo);
      throw new AuthenticationError(
        `Quá nhiều yêu cầu. Vui lòng đợi ${Math.ceil(resendStatus.waitTime / 60)} phút`
      );
    }
    // Log cooldown event
    logCooldown(normalizedPhone, resendStatus.waitTime, clientInfo);
    return {
      success: false,
      message: `Vui lòng đợi ${resendStatus.waitTime} giây trước khi gửi lại`,
      cooldownSeconds: resendStatus.waitTime
    };
  }
  
  // Invalidate existing OTPs (Requirement 3.1)
  await Otp.updateMany(
    { phone: normalizedPhone, isUsed: false },
    { isUsed: true }
  );
  
  // Log resend attempt (actual send will be logged by sendOtp)
  logResendOtp(normalizedPhone, true, {
    ...clientInfo,
    details: { action: 'invalidated_old_otp' }
  });
  
  // Send new OTP (Requirement 3.2)
  return sendOtp(phone, clientInfo);
};

module.exports = {
  // Core functions
  generateOtp,
  hashOtp,
  verifyOtpHash,
  normalizePhone,
  validatePhone,
  
  // Main operations
  sendOtp,
  verifyOtp,
  resendOtp,
  canResendOtp,
  
  // Rate limiting (exported for testing)
  checkRateLimit,
  checkLockout,
  calculateCooldown,
  
  // Configuration (exported for testing)
  OTP_CONFIG
};
