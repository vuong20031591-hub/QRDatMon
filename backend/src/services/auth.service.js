/**
 * Authentication Service
 * Handles Firebase token verification, guest user creation, and session token management
 * Requirements: 1.1, 1.5, 24.4
 */

const bcrypt = require('bcryptjs');
const { User, Staff } = require('../models');
const { verifyIdToken, getUserByUid } = require('../config/firebase');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const {
  AuthenticationError,
  InvalidTokenError,
  NotFoundError,
  ConflictError
} = require('../utils/errors');
const { AUTH_PROVIDER } = require('../utils/constants');

/**
 * Verify Firebase ID token and get/create user
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} User data with tokens
 */
const verifyFirebaseToken = async (idToken) => {
  // Verify the Firebase token
  let decodedToken;
  try {
    decodedToken = await verifyIdToken(idToken);
  } catch (error) {
    throw new InvalidTokenError(error.message || 'Invalid Firebase token');
  }

  const { uid, email, name, picture } = decodedToken;

  // Check if user exists by Firebase UID
  let user = await User.findOne({ firebaseUid: uid });

  if (!user && email) {
    // Check if user exists by email (might have registered differently before)
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Link Firebase UID to existing user
      user.firebaseUid = uid;
      user.authProvider = AUTH_PROVIDER.GOOGLE;
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }
      await user.save();
    }
  }

  if (!user) {
    // Create new user
    user = await User.create({
      firebaseUid: uid,
      email: email ? email.toLowerCase() : undefined,
      name: name || email?.split('@')[0] || 'User',
      avatarUrl: picture,
      authProvider: AUTH_PROVIDER.GOOGLE,
      isGuest: false,
      isActive: true
    });
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated. Please contact support.');
  }

  // Check if user is a staff member
  const staff = await Staff.findOne({ user: user._id, isActive: true });

  // Generate tokens
  const tokens = generateTokenPair(user, staff);

  return {
    user: formatUserResponse(user, staff),
    ...tokens
  };
};

/**
 * Create a guest user session
 * @param {Object} options - Guest user options
 * @param {string} options.deviceId - Device identifier
 * @param {string} options.name - Optional display name
 * @returns {Promise<Object>} Guest user data with tokens
 */
const createGuestUser = async (options = {}) => {
  const { deviceId, name } = options;

  // Generate a unique guest identifier
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Create guest user
  const user = await User.create({
    name: name || `Guest ${guestId.substring(6, 12)}`,
    isGuest: true,
    authProvider: AUTH_PROVIDER.LOCAL,
    isActive: true
  });

  // Generate tokens (guest tokens have shorter expiry)
  const tokens = generateTokenPair(user, null);

  return {
    user: formatUserResponse(user, null),
    ...tokens
  };
};

/**
 * Refresh session tokens
 * @param {Object} user - User object from verifyRefreshToken middleware
 * @returns {Promise<Object>} New tokens
 */
const refreshSessionToken = async (user) => {
  // Check if user is still active
  const currentUser = await User.findById(user._id);

  if (!currentUser) {
    throw new NotFoundError('User not found');
  }

  if (!currentUser.isActive) {
    throw new AuthenticationError('Your account has been deactivated');
  }

  // Check if user is a staff member
  const staff = await Staff.findOne({ user: currentUser._id, isActive: true });

  // Generate new tokens
  const tokens = generateTokenPair(currentUser, staff);

  return {
    user: formatUserResponse(currentUser, staff),
    ...tokens
  };
};

/**
 * Get current user info
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated');
  }

  // Check if user is a staff member
  const staff = await Staff.findOne({ user: user._id, isActive: true });

  return formatUserResponse(user, staff);
};

/**
 * Link guest account to Firebase account
 * @param {Object} guestUser - Guest user object
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<Object>} Updated user with tokens
 */
const linkGuestToFirebase = async (guestUser, idToken) => {
  if (!guestUser.isGuest) {
    throw new ConflictError('Only guest accounts can be linked');
  }

  // Verify the Firebase token
  let decodedToken;
  try {
    decodedToken = await verifyIdToken(idToken);
  } catch (error) {
    throw new InvalidTokenError(error.message || 'Invalid Firebase token');
  }

  const { uid, email, name, picture } = decodedToken;

  // Check if Firebase UID is already linked to another account
  const existingUser = await User.findOne({ firebaseUid: uid });
  if (existingUser && existingUser._id.toString() !== guestUser._id.toString()) {
    throw new ConflictError('This Google account is already linked to another user');
  }

  // Check if email is already used by another account
  if (email) {
    const emailUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: guestUser._id }
    });
    if (emailUser) {
      throw new ConflictError('An account with this email already exists');
    }
  }

  // Update guest user to full user
  guestUser.firebaseUid = uid;
  guestUser.email = email ? email.toLowerCase() : undefined;
  guestUser.name = name || guestUser.name;
  guestUser.avatarUrl = picture || guestUser.avatarUrl;
  guestUser.authProvider = AUTH_PROVIDER.GOOGLE;
  guestUser.isGuest = false;
  await guestUser.save();

  // Generate new tokens
  const tokens = generateTokenPair(guestUser, null);

  return {
    user: formatUserResponse(guestUser, null),
    ...tokens
  };
};

/**
 * Logout user (invalidate session if needed)
 * Note: With JWT, we can't truly invalidate tokens server-side without a blacklist.
 * This function is mainly for logging and client-side cleanup.
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
const logoutUser = async (user) => {
  // For now, just log the logout
  // In production, you might want to:
  // 1. Add token to blacklist (Redis)
  // 2. Update user's lastLogout timestamp
  // 3. Revoke Firebase tokens if needed

  console.log(`[Auth] User logged out: ${user._id}`);
  return { message: 'Logged out successfully' };
};

/**
 * Generate access and refresh token pair
 * @param {Object} user - User object
 * @param {Object|null} staff - Staff object if user is staff
 * @returns {Object} Token pair
 */
const generateTokenPair = (user, staff) => {
  const accessToken = generateAccessToken(user, {
    staffRole: staff?.role || null
  });

  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer'
  };
};

/**
 * Format user response (exclude sensitive fields)
 * @param {Object} user - User document
 * @param {Object|null} staff - Staff document if exists
 * @returns {Object} Formatted user object
 */
const formatUserResponse = (user, staff) => {
  const response = {
    id: user._id,
    email: user.email || null,
    name: user.name,
    avatarUrl: user.avatarUrl || null,
    phone: user.phone || null,
    authProvider: user.authProvider,
    isGuest: user.isGuest,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  // Include staff info if user is a staff member
  if (staff) {
    response.staff = {
      id: staff._id,
      employeeCode: staff.employeeCode,
      role: staff.role,
      hireDate: staff.hireDate
    };
  }

  return response;
};

/**
 * Validate user can perform staff actions
 * @param {string} userId - User ID
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Promise<Object>} Staff object if valid
 */
const validateStaffAccess = async (userId, allowedRoles = []) => {
  const staff = await Staff.findOne({ user: userId, isActive: true });

  if (!staff) {
    throw new AuthenticationError('Staff access required');
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(staff.role)) {
    throw new AuthenticationError(`Required role: ${allowedRoles.join(' or ')}`);
  }

  return staff;
};

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data with tokens
 */
const loginWithPassword = async (email, password) => {
  // Find user by email with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw new AuthenticationError('Email hoặc mật khẩu không đúng');
  }

  if (!user.passwordHash) {
    throw new AuthenticationError('Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthenticationError('Email hoặc mật khẩu không đúng');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Tài khoản đã bị vô hiệu hóa');
  }

  // Check if user is a staff member
  const staff = await Staff.findOne({ user: user._id, isActive: true });

  // Generate tokens
  const tokens = generateTokenPair(user, staff);

  return {
    user: formatUserResponse(user, staff),
    ...tokens
  };
};

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

/**
 * Send OTP to phone number via TextBee
 * @param {string} phoneNumber - Phone number (format: +84xxxxxxxxx or 0xxxxxxxxx)
 * @returns {Promise<Object>} Success response
 */
const sendOtp = async (phoneNumber) => {
  const axios = require('axios');
  
  // Format phone number
  let formattedPhone = phoneNumber.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+84' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('+84')) {
    formattedPhone = '+84' + formattedPhone;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with expiry (5 minutes)
  const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRES_IN || 300) * 1000;
  otpStore.set(formattedPhone, {
    otp,
    expiresAt,
    attempts: 0
  });

  // Send OTP via TextBee
  try {
    const message = `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`;
    
    const response = await axios.post(
      `${process.env.TEXTBEE_API_URL}/send`,
      {
        device_id: process.env.TEXTBEE_DEVICE_ID,
        phone: formattedPhone,
        message: message
      },
      {
        headers: {
          'x-api-key': process.env.TEXTBEE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[Auth] OTP sent to ${formattedPhone}: ${otp}`);
    
    return {
      success: true,
      phoneNumber: formattedPhone,
      expiresIn: parseInt(process.env.OTP_EXPIRES_IN || 300)
    };
  } catch (error) {
    console.error('[Auth] Failed to send OTP via TextBee:', error.message);
    
    // For development, still return success even if SMS fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth] DEV MODE - OTP for ${formattedPhone}: ${otp}`);
      return {
        success: true,
        phoneNumber: formattedPhone,
        expiresIn: parseInt(process.env.OTP_EXPIRES_IN || 300),
        devOtp: otp // Only in development
      };
    }
    
    throw new Error('Không thể gửi OTP. Vui lòng thử lại sau.');
  }
};

/**
 * Verify OTP and create/login user
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} User data with tokens
 */
const verifyOtp = async (phoneNumber, otp) => {
  // Format phone number
  let formattedPhone = phoneNumber.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+84' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('+84')) {
    formattedPhone = '+84' + formattedPhone;
  }

  // Get stored OTP
  const storedData = otpStore.get(formattedPhone);
  
  if (!storedData) {
    throw new AuthenticationError('Mã OTP không tồn tại hoặc đã hết hạn');
  }

  // Check expiry
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(formattedPhone);
    throw new AuthenticationError('Mã OTP đã hết hạn');
  }

  // Check attempts
  if (storedData.attempts >= parseInt(process.env.OTP_MAX_ATTEMPTS || 3)) {
    otpStore.delete(formattedPhone);
    throw new AuthenticationError('Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới');
  }

  // Verify OTP
  if (storedData.otp !== otp) {
    storedData.attempts++;
    throw new AuthenticationError('Mã OTP không đúng');
  }

  // OTP verified, delete from store
  otpStore.delete(formattedPhone);

  // Find or create user
  let user = await User.findOne({ phone: formattedPhone });

  if (!user) {
    // Create new user
    user = await User.create({
      phone: formattedPhone,
      name: `User ${formattedPhone.substring(formattedPhone.length - 4)}`,
      authProvider: AUTH_PROVIDER.PHONE,
      isGuest: false,
      isActive: true
    });
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Tài khoản đã bị vô hiệu hóa');
  }

  // Check if user is a staff member
  const staff = await Staff.findOne({ user: user._id, isActive: true });

  // Generate tokens
  const tokens = generateTokenPair(user, staff);

  return {
    user: formatUserResponse(user, staff),
    ...tokens
  };
};

module.exports = {
  verifyFirebaseToken,
  createGuestUser,
  refreshSessionToken,
  getCurrentUser,
  linkGuestToFirebase,
  logoutUser,
  loginWithPassword,
  sendOtp,
  verifyOtp,
  generateTokenPair,
  formatUserResponse,
  validateStaffAccess
};
