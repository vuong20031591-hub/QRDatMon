/**
 * Image Routes
 * API endpoints for optimized image management
 * Requirements: 1.1-1.5, 3.1-3.5, 4.1-4.4, 5.1-5.4, 6.3
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { uploadSingle, UPLOAD_DIR } = require('../middleware/upload');
const { imageNegotiation, findBestVariant } = require('../middleware/image-negotiation');
const { imageOptimizer } = require('../services/image-optimizer.service');
const { ImageMetadata } = require('../models');
const { ok, created, notFound, badRequest, internalError } = require('../utils/response');
const { UPLOAD_BASE_DIR } = require('../utils/image-utils');

/**
 * @swagger
 * /api/images/{id}:
 *   get:
 *     summary: Get optimized image with content negotiation
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         description: Requested width for size selection
 *     responses:
 *       200:
 *         description: Image file
 *       404:
 *         description: Image not found
 */
router.get('/:id',
  imageNegotiation,
  async (req, res, next) => {
    try {
      const imageDoc = await ImageMetadata.findById(req.params.id);
      
      if (!imageDoc) {
        return notFound(res, 'Image not found');
      }
      
      const { preferredFormat, preferredSize } = req.imagePreferences;
      const variant = findBestVariant(imageDoc.variants, preferredFormat, preferredSize);
      
      if (!variant) {
        return notFound(res, 'No suitable variant found');
      }
      
      const filePath = path.join(UPLOAD_BASE_DIR, variant.path.replace('/uploads/', ''));
      
      // Set cache headers (1 year for immutable assets)
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': `image/${variant.format === 'jpeg' ? 'jpeg' : variant.format}`,
        'Vary': 'Accept'
      });
      
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/images/{id}/metadata:
 *   get:
 *     summary: Get image metadata for lazy loading
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image metadata
 *       404:
 *         description: Image not found
 */
router.get('/:id/metadata',
  async (req, res, next) => {
    try {
      const imageDoc = await ImageMetadata.findById(req.params.id);
      
      if (!imageDoc) {
        return notFound(res, 'Image not found');
      }
      
      // Build variant URLs
      const variantUrls = {};
      for (const variant of imageDoc.variants) {
        const key = `${variant.size}_${variant.format}`;
        variantUrls[key] = `/api/images/${imageDoc._id}?format=${variant.format}&size=${variant.size}`;
      }
      
      return ok(res, {
        id: imageDoc._id,
        originalName: imageDoc.originalName,
        dimensions: {
          width: imageDoc.metadata.width,
          height: imageDoc.metadata.height,
          aspectRatio: imageDoc.metadata.aspectRatio
        },
        dominantColor: imageDoc.metadata.dominantColor,
        lqip: imageDoc.lqip,
        variants: variantUrls,
        basePath: imageDoc.basePath
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload and optimize image
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 enum: [menu-items, categories, general]
 *     responses:
 *       200:
 *         description: Image uploaded and optimized
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post('/upload',
  authenticate,
  requireRole('admin', 'manager'),
  uploadSingle('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return badRequest(res, 'No file uploaded');
      }
      
      const category = req.body.category || 'general';
      const validCategories = ['menu-items', 'categories', 'general'];
      
      if (!validCategories.includes(category)) {
        return badRequest(res, 'Invalid category');
      }
      
      const result = await imageOptimizer.processImage(req.file, category);
      
      return created(res, {
        message: 'Image uploaded and optimized successfully',
        image: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete image and all variants
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted
 *       404:
 *         description: Image not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id',
  authenticate,
  requireRole('admin', 'manager'),
  async (req, res, next) => {
    try {
      await imageOptimizer.deleteImageWithVariants(req.params.id);
      
      return ok(res, {
        message: 'Image and all variants deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Image not found') {
        return notFound(res, 'Image not found');
      }
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/images/batch-process:
 *   post:
 *     summary: Batch process existing images
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [menu-items, categories, general]
 *     responses:
 *       200:
 *         description: Batch processing results
 *       401:
 *         description: Unauthorized
 */
router.post('/batch-process',
  authenticate,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const category = req.body.category || 'menu-items';
      const directory = path.join(UPLOAD_DIR, category);
      
      const results = await imageOptimizer.batchProcess(directory, category);
      
      return ok(res, {
        message: 'Batch processing completed',
        results
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: List all images with pagination
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of images
 */
router.get('/',
  async (req, res, next) => {
    try {
      const { category, page = 1, limit = 20 } = req.query;
      
      const query = {};
      if (category) query.category = category;
      
      const images = await ImageMetadata.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10))
        .select('originalName category basePath metadata.width metadata.height metadata.aspectRatio lqip createdAt');
      
      const total = await ImageMetadata.countDocuments(query);
      
      return ok(res, {
        images,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
