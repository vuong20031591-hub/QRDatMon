/**
 * Role-Based Access Control Middleware
 * Checks user role against required roles and returns 403 if insufficient permissions
 * Requirements: 1.4, 9.1
 */

const { Staff } = require('../models');
const { ForbiddenError, AuthenticationError } = require('../utils/errors');
const { USER_ROLES, ROLE_HIERARCHY } = require('../utils/constants');

/**
 * Check if user has one of the required roles
 * @param {Array<string>} allowedRoles - Array of allowed role names
 * @returns {Function} Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Guest users cannot have staff roles
      if (req.user.isGuest) {
        throw new ForbiddenError('Guest users do not have access to this resource');
      }

      // Check if user has staff role in token
      if (req.token && req.token.staffRole) {
        if (allowedRoles.includes(req.token.staffRole)) {
          req.staffRole = req.token.staffRole;
          return next();
        }
      }

      // Look up staff record in database
      const staff = await Staff.findOne({
        user: req.user._id,
        isActive: true
      });

      if (!staff) {
        throw new ForbiddenError('You do not have staff privileges');
      }

      // Check if staff role is in allowed roles
      if (!allowedRoles.includes(staff.role)) {
        throw new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${staff.role}`
        );
      }

      // Attach staff info to request for later use
      req.staff = staff;
      req.staffRole = staff.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has minimum role level (hierarchical check)
 * Uses ROLE_HIERARCHY to determine if user's role is >= required level
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Express middleware function
 */
const requireMinRole = (minimumRole) => {
  return async (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Guest users cannot have staff roles
      if (req.user.isGuest) {
        throw new ForbiddenError('Guest users do not have access to this resource');
      }

      const minLevel = ROLE_HIERARCHY[minimumRole];
      if (minLevel === undefined) {
        throw new Error(`Invalid role specified: ${minimumRole}`);
      }

      // Check if user has staff role in token
      if (req.token && req.token.staffRole) {
        const userLevel = ROLE_HIERARCHY[req.token.staffRole];
        if (userLevel !== undefined && userLevel >= minLevel) {
          req.staffRole = req.token.staffRole;
          return next();
        }
      }

      // Look up staff record in database
      const staff = await Staff.findOne({
        user: req.user._id,
        isActive: true
      });

      if (!staff) {
        throw new ForbiddenError('You do not have staff privileges');
      }

      const userLevel = ROLE_HIERARCHY[staff.role];
      if (userLevel === undefined || userLevel < minLevel) {
        throw new ForbiddenError(
          `Access denied. Minimum required role: ${minimumRole}. Your role: ${staff.role}`
        );
      }

      // Attach staff info to request for later use
      req.staff = staff;
      req.staffRole = staff.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is admin
 * Shorthand for requireRole(USER_ROLES.ADMIN)
 */
const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Check if user is manager or higher
 * Shorthand for requireMinRole(USER_ROLES.MANAGER)
 */
const requireManager = requireMinRole(USER_ROLES.MANAGER);

/**
 * Check if user is any staff member
 * Allows any authenticated staff regardless of role
 */
const requireStaff = async (req, res, next) => {
  try {
    // User must be authenticated first
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Guest users cannot be staff
    if (req.user.isGuest) {
      throw new ForbiddenError('Guest users do not have access to this resource');
    }

    // Check if user has staff role in token
    if (req.token && req.token.staffRole) {
      req.staffRole = req.token.staffRole;
      return next();
    }

    // Look up staff record in database
    const staff = await Staff.findOne({
      user: req.user._id,
      isActive: true
    });

    if (!staff) {
      throw new ForbiddenError('Staff access required');
    }

    // Attach staff info to request
    req.staff = staff;
    req.staffRole = staff.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is kitchen staff
 * Kitchen staff have specific permissions for order item status updates
 */
const requireKitchen = requireRole(USER_ROLES.KITCHEN, USER_ROLES.MANAGER, USER_ROLES.ADMIN);

/**
 * Check if user is cashier
 * Cashiers can process payments and manage bills
 */
const requireCashier = requireRole(USER_ROLES.CASHIER, USER_ROLES.MANAGER, USER_ROLES.ADMIN);

/**
 * Check if user owns the resource or is staff
 * Useful for endpoints where users can access their own data or staff can access any
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 * @returns {Function} Express middleware function
 */
const requireOwnerOrStaff = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Get the resource owner ID
      const ownerId = await getResourceOwnerId(req);

      // Check if user is the owner
      if (ownerId && req.user._id.toString() === ownerId.toString()) {
        return next();
      }

      // Check if user is staff
      const staff = await Staff.findOne({
        user: req.user._id,
        isActive: true
      });

      if (staff) {
        req.staff = staff;
        req.staffRole = staff.role;
        return next();
      }

      throw new ForbiddenError('You do not have permission to access this resource');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check self or admin access
 * User can access their own data, or admin can access anyone's data
 * @param {string} paramName - Name of the route parameter containing user ID
 */
const requireSelfOrAdmin = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const targetUserId = req.params[paramName];

      // Check if accessing own data
      if (req.user._id.toString() === targetUserId) {
        return next();
      }

      // Check if user is admin
      const staff = await Staff.findOne({
        user: req.user._id,
        isActive: true,
        role: USER_ROLES.ADMIN
      });

      if (staff) {
        req.staff = staff;
        req.staffRole = staff.role;
        return next();
      }

      throw new ForbiddenError('You can only access your own data');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Attach staff info to request if user is staff
 * Non-blocking - doesn't throw error if user is not staff
 * Useful for endpoints that behave differently for staff vs regular users
 */
const attachStaffInfo = async (req, res, next) => {
  try {
    if (req.user && !req.user.isGuest) {
      const staff = await Staff.findOne({
        user: req.user._id,
        isActive: true
      });

      if (staff) {
        req.staff = staff;
        req.staffRole = staff.role;
      }
    }
    next();
  } catch (error) {
    // Non-blocking, continue even if error
    next();
  }
};

module.exports = {
  requireRole,
  requireMinRole,
  requireAdmin,
  requireManager,
  requireStaff,
  requireKitchen,
  requireCashier,
  requireOwnerOrStaff,
  requireSelfOrAdmin,
  attachStaffInfo
};
