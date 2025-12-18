/**
 * ImageMetadata Model
 * Stores metadata for optimized images including variants, dimensions, and LQIP
 * Requirements: 4.1, 6.1
 */

const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  format: {
    type: String,
    enum: ['webp', 'avif', 'jpeg', 'png', 'gif'],
    required: true
  },
  size: {
    type: String,
    enum: ['thumbnail', 'small', 'medium', 'large', 'original'],
    required: true
  },
  path: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    min: 1
  },
  height: {
    type: Number,
    min: 1
  },
  fileSize: {
    type: Number,
    min: 0
  }
}, { _id: false });

const imageMetadataSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['menu-items', 'categories', 'general'],
    index: true
  },
  basePath: {
    type: String,
    required: true
  },
  metadata: {
    width: {
      type: Number,
      required: true,
      min: 1
    },
    height: {
      type: Number,
      required: true,
      min: 1
    },
    aspectRatio: {
      type: Number,
      required: true
    },
    dominantColor: {
      type: String
    },
    originalFormat: {
      type: String
    }
  },
  variants: [variantSchema],
  lqip: {
    type: String  // Base64 encoded low-quality image placeholder
  },
  isProcessed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
imageMetadataSchema.index({ category: 1, isProcessed: 1 });
imageMetadataSchema.index({ originalName: 1, category: 1 });

module.exports = mongoose.model('ImageMetadata', imageMetadataSchema);
