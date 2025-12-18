/**
 * Upload Routes
 * Handles file upload endpoints
 * Requirements: 25.1, 25.2, 25.3, 25.4
 */

const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { uploadSingle, uploadMultiple, UPLOAD_DIR, THUMBNAILS_DIR } = require('../middleware/upload');
const imageService = require('../services/image.service');
const { imageOptimizer } = require('../services/image-optimizer.service');
const { ok, created, badRequest, notFound } = require('../utils/response');

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Upload]
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
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post('/image',
  authenticate,
  requireRole('admin', 'manager'),
  uploadSingle('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return badRequest(res, 'No file uploaded');
      }

      // Use new optimizer if optimize query param is set
      const useOptimizer = req.query.optimize === 'true';
      const category = req.body.category || 'menu-items';
      
      let imageInfo;
      if (useOptimizer) {
        imageInfo = await imageOptimizer.processImage(req.file, category);
      } else {
        imageInfo = await imageService.processImage(req.file);
      }

      return created(res, {
        message: 'Image uploaded successfully',
        ...imageInfo
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post('/images',
  authenticate,
  requireRole('admin', 'manager'),
  uploadMultiple('images', 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return badRequest(res, 'No files uploaded');
      }

      const useOptimizer = req.query.optimize === 'true';
      const category = req.body.category || 'menu-items';

      const results = await Promise.all(
        req.files.map(file => 
          useOptimizer 
            ? imageOptimizer.processImage(file, category)
            : imageService.processImage(file)
        )
      );

      return created(res, {
        message: `${results.length} images uploaded successfully`,
        images: results
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/upload/{filename}:
 *   delete:
 *     summary: Delete an uploaded image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete('/:filename',
  authenticate,
  requireRole('admin', 'manager'),
  async (req, res, next) => {
    try {
      const { filename } = req.params;
      await imageService.deleteImage(`/uploads/${filename}`);

      return ok(res, {
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Serve uploaded files with caching
router.get('/file/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { size } = req.query; // small, medium, large

    let filePath;
    if (size && ['small', 'medium', 'large'].includes(size)) {
      const baseName = path.parse(filename).name;
      const ext = path.extname(filename);
      filePath = path.join(THUMBNAILS_DIR, `${baseName}-${size}${ext}`);
    } else {
      filePath = path.join(UPLOAD_DIR, filename);
    }

    res.set('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
