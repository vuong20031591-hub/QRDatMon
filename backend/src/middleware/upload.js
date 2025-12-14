/**
 * File Upload Middleware
 * Handles file uploads using multer with validation
 * Requirements: 25.1
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ValidationError } = require('../utils/errors');

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// File size limits (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure upload directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }
};

ensureDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new ValidationError(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`), false);
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new ValidationError(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }

  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Max 5 files per request
  }
});

// Single file upload middleware
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
        }
        return next(new ValidationError(err.message));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ValidationError(`Too many files. Maximum: ${maxCount}`));
        }
        return next(new ValidationError(err.message));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  UPLOAD_DIR,
  THUMBNAILS_DIR,
  ALLOWED_TYPES,
  MAX_FILE_SIZE
};
