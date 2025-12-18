/**
 * Image Optimizer Service
 * Handles image processing, format conversion, resizing, and optimization
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1-2.6, 4.1, 4.2, 5.1-5.4, 6.1-6.3
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { ImageMetadata } = require('../models');
const {
  UPLOAD_BASE_DIR,
  slugify,
  ensureImageDirectory,
  getRelativePath,
  generateVariantFilename,
  fileExists,
  deleteDirectory
} = require('../utils/image-utils');

// Default configuration
const DEFAULT_CONFIG = {
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85
  },
  formats: ['webp', 'avif', 'jpeg'],
  sizes: [
    { name: 'thumbnail', width: 150, height: 150, fit: 'cover' },
    { name: 'small', width: 320, height: null, fit: 'inside' },
    { name: 'medium', width: 640, height: null, fit: 'inside' },
    { name: 'large', width: 1024, height: null, fit: 'inside' }
  ],
  generateLQIP: true,
  lqipSize: 20
};

class ImageOptimizerService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Convert image to specified format
   * @param {string} sourcePath - Source image path
   * @param {string} outputPath - Output file path
   * @param {string} format - Target format (webp, avif, jpeg)
   * @returns {Promise<Object>} Conversion result with file info
   */
  async convertToFormat(sourcePath, outputPath, format) {
    const quality = this.config.quality[format] || 85;
    
    try {
      let sharpInstance = sharp(sourcePath);
      
      switch (format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      const info = await sharpInstance.toFile(outputPath);
      
      return {
        success: true,
        path: outputPath,
        format,
        width: info.width,
        height: info.height,
        fileSize: info.size
      };
    } catch (error) {
      console.error(`Format conversion failed for ${format}:`, error.message);
      return { success: false, format, error: error.message };
    }
  }

  /**
   * Generate size variants for an image
   * @param {string} sourcePath - Source image path
   * @param {string} outputDir - Output directory
   * @param {Object} sourceMetadata - Source image metadata
   * @returns {Promise<Array>} Array of generated variants
   */
  async generateSizeVariants(sourcePath, outputDir, sourceMetadata) {
    const variants = [];
    
    for (const sizeConfig of this.config.sizes) {
      // Skip upscaling if source is smaller than target
      if (sizeConfig.width > sourceMetadata.width && 
          (!sizeConfig.height || sizeConfig.height > sourceMetadata.height)) {
        continue;
      }
      
      for (const format of this.config.formats) {
        const quality = this.config.quality[format] || 85;
        const filename = generateVariantFilename(sizeConfig.name, quality, format);
        const outputPath = path.join(outputDir, filename);
        
        try {
          let sharpInstance = sharp(sourcePath);
          
          // Resize based on configuration
          if (sizeConfig.height) {
            sharpInstance = sharpInstance.resize(sizeConfig.width, sizeConfig.height, {
              fit: sizeConfig.fit || 'cover',
              position: 'center'
            });
          } else {
            sharpInstance = sharpInstance.resize(sizeConfig.width, null, {
              fit: 'inside',
              withoutEnlargement: true
            });
          }
          
          // Apply format conversion
          switch (format) {
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality });
              break;
            case 'avif':
              sharpInstance = sharpInstance.avif({ quality });
              break;
            case 'jpeg':
              sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
              break;
          }
          
          const info = await sharpInstance.toFile(outputPath);
          
          variants.push({
            format,
            size: sizeConfig.name,
            path: getRelativePath(outputPath),
            width: info.width,
            height: info.height,
            fileSize: info.size
          });
        } catch (error) {
          console.error(`Failed to generate ${sizeConfig.name} ${format}:`, error.message);
        }
      }
    }
    
    return variants;
  }

  /**
   * Extract metadata from image
   * @param {string} imagePath - Image file path
   * @returns {Promise<Object>} Image metadata
   */
  async extractMetadata(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    const stats = await sharp(imagePath).stats();
    
    // Calculate dominant color from stats
    const dominantColor = stats.dominant 
      ? `rgb(${Math.round(stats.dominant.r)},${Math.round(stats.dominant.g)},${Math.round(stats.dominant.b)})`
      : null;
    
    return {
      width: metadata.width,
      height: metadata.height,
      aspectRatio: Number((metadata.width / metadata.height).toFixed(4)),
      dominantColor,
      originalFormat: metadata.format
    };
  }

  /**
   * Generate Low Quality Image Placeholder (LQIP)
   * @param {string} imagePath - Image file path
   * @returns {Promise<string>} Base64 encoded LQIP
   */
  async generateLQIP(imagePath) {
    const lqipSize = this.config.lqipSize || 20;
    
    const buffer = await sharp(imagePath)
      .resize(lqipSize, lqipSize, { fit: 'inside' })
      .blur(1)
      .jpeg({ quality: 50 })
      .toBuffer();
    
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  }

  /**
   * Main method to process an uploaded image
   * @param {Object} file - Multer file object
   * @param {string} category - Image category
   * @returns {Promise<Object>} Processed image data
   */
  async processImage(file, category = 'general') {
    const originalPath = file.path;
    const originalName = file.originalname;
    
    // Create directory structure
    const outputDir = await ensureImageDirectory(category, originalName);
    const slug = slugify(path.parse(originalName).name);
    
    // Extract metadata
    const metadata = await this.extractMetadata(originalPath);
    
    // Generate LQIP
    const lqip = this.config.generateLQIP 
      ? await this.generateLQIP(originalPath) 
      : null;
    
    // Generate size variants
    const variants = await this.generateSizeVariants(originalPath, outputDir, metadata);
    
    // Copy original to output directory
    const originalExt = path.extname(originalName);
    const originalOutputPath = path.join(outputDir, `original${originalExt}`);
    await fs.copyFile(originalPath, originalOutputPath);
    
    // Add original to variants
    const originalStats = await fs.stat(originalOutputPath);
    variants.push({
      format: metadata.originalFormat,
      size: 'original',
      path: getRelativePath(originalOutputPath),
      width: metadata.width,
      height: metadata.height,
      fileSize: originalStats.size
    });
    
    // Save to database
    const imageMetadata = await ImageMetadata.create({
      originalName,
      category,
      basePath: `/uploads/${category}/${slug}`,
      metadata,
      variants,
      lqip,
      isProcessed: true,
      processedAt: new Date()
    });
    
    // Clean up temp file
    try {
      await fs.unlink(originalPath);
    } catch (err) {
      console.warn('Failed to clean up temp file:', err.message);
    }
    
    return {
      id: imageMetadata._id,
      originalName,
      category,
      basePath: imageMetadata.basePath,
      variants,
      metadata,
      lqip
    };
  }

  /**
   * Delete image and all its variants
   * @param {string} imageId - ImageMetadata document ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteImageWithVariants(imageId) {
    const imageDoc = await ImageMetadata.findById(imageId);
    if (!imageDoc) {
      throw new Error('Image not found');
    }
    
    // Delete directory containing all variants
    const dirPath = path.join(UPLOAD_BASE_DIR, imageDoc.basePath.replace('/uploads/', ''));
    await deleteDirectory(dirPath);
    
    // Remove from database
    await ImageMetadata.findByIdAndDelete(imageId);
    
    return true;
  }

  /**
   * Batch process images in a directory
   * @param {string} directory - Directory to scan
   * @param {string} category - Category for processed images
   * @returns {Promise<Object>} Batch processing results
   */
  async batchProcess(directory, category = 'general') {
    const results = {
      processed: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };
    
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    try {
      const files = await fs.readdir(directory);
      
      for (const filename of files) {
        const ext = path.extname(filename).toLowerCase();
        if (!supportedExtensions.includes(ext)) continue;
        
        const filePath = path.join(directory, filename);
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) continue;
        
        // Check if already processed
        const existing = await ImageMetadata.findOne({
          originalName: filename,
          category,
          isProcessed: true
        });
        
        if (existing) {
          results.skipped++;
          continue;
        }
        
        try {
          await this.processImage(
            { path: filePath, originalname: filename },
            category
          );
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push({ filename, error: error.message });
          console.error(`Failed to process ${filename}:`, error.message);
        }
      }
    } catch (error) {
      throw new Error(`Batch processing failed: ${error.message}`);
    }
    
    return results;
  }
}

// Export singleton instance and class
const imageOptimizer = new ImageOptimizerService();

module.exports = {
  ImageOptimizerService,
  imageOptimizer
};
