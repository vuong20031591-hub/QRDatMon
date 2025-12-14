/**
 * Image Service
 * Handles image processing, thumbnail generation, and file management
 * Requirements: 25.1, 25.2, 25.3
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { UPLOAD_DIR, THUMBNAILS_DIR } = require('../middleware/upload');
const { NotFoundError } = require('../utils/errors');

// Thumbnail sizes
const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 }
};

/**
 * Process uploaded image and generate thumbnails
 * @param {Object} file - Multer file object
 * @returns {Object} Image info with paths
 */
const processImage = async (file) => {
  const filename = file.filename;
  const originalPath = file.path;
  const baseName = path.parse(filename).name;
  const ext = path.extname(filename);

  const thumbnails = {};

  // Generate thumbnails for each size
  for (const [size, dimensions] of Object.entries(THUMBNAIL_SIZES)) {
    const thumbFilename = `${baseName}-${size}${ext}`;
    const thumbPath = path.join(THUMBNAILS_DIR, thumbFilename);

    await sharp(originalPath)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(thumbPath);

    thumbnails[size] = `/uploads/thumbnails/${thumbFilename}`;
  }

  return {
    original: `/uploads/${filename}`,
    thumbnails,
    filename,
    mimetype: file.mimetype,
    size: file.size
  };
};

/**
 * Delete image and its thumbnails
 * @param {string} imagePath - Path to original image (e.g., /uploads/image.jpg)
 */
const deleteImage = async (imagePath) => {
  if (!imagePath) return;

  const filename = path.basename(imagePath);
  const baseName = path.parse(filename).name;
  const ext = path.extname(filename);

  // Delete original
  const originalFullPath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(originalFullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  // Delete thumbnails
  for (const size of Object.keys(THUMBNAIL_SIZES)) {
    const thumbFilename = `${baseName}-${size}${ext}`;
    const thumbPath = path.join(THUMBNAILS_DIR, thumbFilename);
    try {
      await fs.unlink(thumbPath);
    } catch (err) {
      if (err.code !== 'ENOENT') continue;
    }
  }
};

/**
 * Get image file with caching headers
 * @param {string} filename - Image filename
 * @param {string} type - 'original' or 'thumbnail'
 * @returns {Object} File info for serving
 */
const getImageInfo = async (filename, type = 'original') => {
  const dir = type === 'thumbnail' ? THUMBNAILS_DIR : UPLOAD_DIR;
  const filePath = path.join(dir, filename);

  try {
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      size: stats.size,
      lastModified: stats.mtime,
      cacheControl: 'public, max-age=31536000' // 1 year cache
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new NotFoundError('Image not found');
    }
    throw err;
  }
};

/**
 * Cleanup orphaned images (images not referenced by any menu item)
 * @param {Array} usedImages - Array of image paths currently in use
 */
const cleanupOrphanedImages = async (usedImages) => {
  const usedFilenames = new Set(usedImages.map(img => path.basename(img)));

  // Get all files in upload directory
  const files = await fs.readdir(UPLOAD_DIR);

  for (const file of files) {
    if (file === 'thumbnails') continue;
    
    if (!usedFilenames.has(file)) {
      await deleteImage(`/uploads/${file}`);
    }
  }
};

module.exports = {
  processImage,
  deleteImage,
  getImageInfo,
  cleanupOrphanedImages,
  THUMBNAIL_SIZES
};
