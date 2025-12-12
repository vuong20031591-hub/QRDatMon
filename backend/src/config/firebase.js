/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin and exports auth verification functions
 * Requirements: 1.1, 1.2
 */

const admin = require('firebase-admin');
const config = require('./index');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */
const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase credentials are configured
    const { projectId, clientEmail, privateKey } = config.firebase;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('[Firebase] Missing Firebase credentials. Firebase Auth will not work.');
      console.warn('[Firebase] Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
      return null;
    }

    // Initialize Firebase Admin with service account
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      }),
      databaseURL: config.firebase.databaseURL
    });

    console.log('[Firebase] Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('[Firebase] Failed to initialize Admin SDK:', error.message);
    return null;
  }
};

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth|null} Firebase Auth instance or null if not initialized
 */
const getAuth = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp ? admin.auth(firebaseApp) : null;
};

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<admin.auth.DecodedIdToken>} Decoded token with user info
 * @throws {Error} If token is invalid or expired
 */
const verifyIdToken = async (idToken) => {
  const auth = getAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    // Verify the ID token and check if it's revoked
    const decodedToken = await auth.verifyIdToken(idToken, true);
    return decodedToken;
  } catch (error) {
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Firebase token has expired');
    }
    if (error.code === 'auth/id-token-revoked') {
      throw new Error('Firebase token has been revoked');
    }
    if (error.code === 'auth/invalid-id-token') {
      throw new Error('Invalid Firebase token');
    }
    if (error.code === 'auth/argument-error') {
      throw new Error('Invalid token format');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Get Firebase user by UID
 * @param {string} uid - Firebase user UID
 * @returns {Promise<admin.auth.UserRecord>} User record
 */
const getUserByUid = async (uid) => {
  const auth = getAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    return await auth.getUser(uid);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

/**
 * Get Firebase user by email
 * @param {string} email - User email
 * @returns {Promise<admin.auth.UserRecord|null>} User record or null
 */
const getUserByEmail = async (email) => {
  const auth = getAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

/**
 * Revoke all refresh tokens for a user
 * Used when logging out or deactivating a user
 * @param {string} uid - Firebase user UID
 */
const revokeRefreshTokens = async (uid) => {
  const auth = getAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    await auth.revokeRefreshTokens(uid);
    console.log(`[Firebase] Revoked tokens for user: ${uid}`);
  } catch (error) {
    console.error(`[Firebase] Failed to revoke tokens for user ${uid}:`, error.message);
    throw error;
  }
};

/**
 * Set custom claims for a user (e.g., role)
 * @param {string} uid - Firebase user UID
 * @param {Object} claims - Custom claims to set
 */
const setCustomUserClaims = async (uid, claims) => {
  const auth = getAuth();

  if (!auth) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    await auth.setCustomUserClaims(uid, claims);
    console.log(`[Firebase] Set custom claims for user ${uid}:`, claims);
  } catch (error) {
    console.error(`[Firebase] Failed to set claims for user ${uid}:`, error.message);
    throw error;
  }
};

/**
 * Check if Firebase is initialized and ready
 * @returns {boolean} True if Firebase is initialized
 */
const isInitialized = () => {
  return firebaseApp !== null;
};

// Initialize Firebase on module load
initializeFirebase();

module.exports = {
  initializeFirebase,
  getAuth,
  verifyIdToken,
  getUserByUid,
  getUserByEmail,
  revokeRefreshTokens,
  setCustomUserClaims,
  isInitialized,
  admin // Export admin for advanced usage
};
