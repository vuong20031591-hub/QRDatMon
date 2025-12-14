/**
 * Authentication Controller
 * Handles authentication endpoints: Google login, guest login, token refresh, logout, and get current user
 * Requirements: 1.1, 1.4, 1.5
 */

const authService = require("../services/auth.service");
const { asyncHandler } = require("../middleware/errorHandler");
const { ok, created } = require("../utils/response");
const { ValidationError } = require("../utils/errors");

/**
 * Google Login Handler
 * POST /api/auth/google
 * Authenticates user with Firebase Google token
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ValidationError("Firebase ID token is required");
  }

  const result = await authService.verifyFirebaseToken(idToken);

  return ok(res, result, "Login successful");
});

/**
 * Guest Login Handler
 * POST /api/auth/guest
 * Creates a temporary guest session
 */
const guestLogin = asyncHandler(async (req, res) => {
  const { deviceId, name } = req.body;

  const result = await authService.createGuestUser({ deviceId, name });

  return created(res, result, "Guest session created");
});

/**
 * Refresh Token Handler
 * POST /api/auth/refresh
 * Refreshes access token using refresh token
 * Note: verifyRefreshToken middleware must be applied before this handler
 */
const refreshToken = asyncHandler(async (req, res) => {
  // req.user is set by verifyRefreshToken middleware
  const result = await authService.refreshSessionToken(req.user);

  return ok(res, result, "Token refreshed successfully");
});

/**
 * Logout Handler
 * POST /api/auth/logout
 * Logs out the current user
 */
const logout = asyncHandler(async (req, res) => {
  const result = await authService.logoutUser(req.user);

  return ok(res, result, "Logged out successfully");
});

/**
 * Get Current User Handler
 * GET /api/auth/me
 * Returns the current authenticated user's information
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);

  return ok(res, { user }, "User retrieved successfully");
});

/**
 * Link Guest to Google Handler
 * POST /api/auth/link-google
 * Links a guest account to a Google account
 */
const linkGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ValidationError("Firebase ID token is required");
  }

  // Ensure user is a guest
  if (!req.user.isGuest) {
    throw new ValidationError("Only guest accounts can be linked to Google");
  }

  const result = await authService.linkGuestToFirebase(req.user, idToken);

  return ok(res, result, "Account linked successfully");
});

/**
 * Verify Token Handler
 * GET /api/auth/verify
 * Verifies if the current token is valid (useful for client-side token validation)
 */
const verifyToken = asyncHandler(async (req, res) => {
  // If we reach here, the token is valid (authenticate middleware passed)
  return ok(
    res,
    {
      valid: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        isGuest: req.user.isGuest,
      },
      tokenInfo: {
        issuedAt: req.token.iat
          ? new Date(req.token.iat * 1000).toISOString()
          : null,
        expiresAt: req.token.exp
          ? new Date(req.token.exp * 1000).toISOString()
          : null,
      },
    },
    "Token is valid",
  );
});

/**
 * Update Profile Handler
 * PUT /api/auth/profile
 * Updates user profile information
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = req.user;

  // Update allowed fields
  if (name !== undefined) {
    user.name = name.trim();
  }
  if (phone !== undefined) {
    user.phone = phone;
  }

  await user.save();

  const updatedUser = await authService.getCurrentUser(user._id);

  return ok(res, { user: updatedUser }, "Profile updated successfully");
});

/**
 * Email/Password Login Handler
 * POST /api/auth/login
 * Authenticates user with email and password
 */
const emailLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email và mật khẩu là bắt buộc");
  }

  const result = await authService.loginWithPassword(email, password);

  return ok(res, result, "Đăng nhập thành công");
});

module.exports = {
  googleLogin,
  guestLogin,
  emailLogin,
  refreshToken,
  logout,
  getMe,
  linkGoogle,
  verifyToken,
  updateProfile,
};
