/**
 * Image Utilities
 * Helper functions for image processing and file organization
 * Requirements: 6.1, 6.2
 */

const fs = require('fs').promises;
const path = require('path');

// Base upload directory
const UPLOAD_BASE_DIR = path.join(__dirname, '../../uploads');

/**
 * Slugify a string for use in file/directory names
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
};

/**
 * Ensure image directory exists for organized storage
 * Creates structure: uploads/{category}/{slug}/
 * @param {string} category - Image category (menu-items, categories, general)
 * @param {string} originalName - Original filename to derive slug
 * @returns {Promise<string>} Full path to the created directory
 */
const ensureImageDirectory = async (category, originalName) => {
  const slug = slugify(path.parse(originalName).name);
  const dirPath = path.join(UPLOAD_BASE_DIR, category, slug);
  
  await fs.mkdir(dirPath, { recursive: true });
  
  return dirPath;
};

/**
 * Get the relative path from uploads directory
 * @param {string} fullPath - Full file path
 * @returns {string} Relative path for URL (includes /uploads prefix)
 */
const getRelativePath = (fullPath) => {
  const relativePath = fullPath.replace(UPLOAD_BASE_DIR, '').replace(/\\/g, '/');
  return `/uploads${relativePath}`;
};

/**
 * Generate variant filename following naming convention
 * Pattern: {size}-{quality}.{format}
 * @param {string} size - Size name (thumbnail, small, medium, large)
 * @param {number} quality - Quality percentage (80, 85)
 * @param {string} format - Image format (webp, avif, jpeg)
 * @returns {string} Formatted filename
 */
const generateVariantFilename = (size, quality, format) => {
  return `${size}-${quality}.${format}`;
};

/**
 * Parse variant filename to extract components
 * @param {string} filename - Variant filename
 * @returns {Object|null} Parsed components or null if invalid
 */
const parseVariantFilename = (filename) => {
  const match = filename.match(/^(thumbnail|small|medium|large|original)-(\d+)\.(webp|avif|jpeg)$/);
  if (!match) return null;
  
  return {
    size: match[1],
    quality: parseInt(match[2], 10),
    format: match[3]
  };
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Delete directory and all contents recursively
 * @param {string} dirPath - Directory path to delete
 */
const deleteDirectory = async (dirPath) => {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};

/**
 * Delete image directory based on imageUrl
 * Extracts the directory path from imageUrl and deletes the entire folder
 * @param {string} imageUrl - Image URL like /uploads/categories/khai-vi/medium-85.webp
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteImageByUrl = async (imageUrl) => {
  if (!imageUrl) return false;
  
  try {
    // Extract directory path from imageUrl
    // e.g., /uploads/categories/khai-vi/medium-85.webp -> uploads/categories/khai-vi
    const relativePath = imageUrl.replace(/^\/uploads\//, '');
    const dirPath = path.dirname(relativePath);
    const fullDirPath = path.join(UPLOAD_BASE_DIR, dirPath);
    
    // Check if directory exists
    if (await fileExists(fullDirPath)) {
      await deleteDirectory(fullDirPath);
      console.log(`[Image] Deleted image directory: ${fullDirPath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`[Image] Error deleting image directory:`, err.message);
    return false;
  }
};

module.exports = {
  UPLOAD_BASE_DIR,
  slugify,
  ensureImageDirectory,
  getRelativePath,
  generateVariantFilename,
  parseVariantFilename,
  fileExists,
  deleteDirectory,
  deleteImageByUrl
};
