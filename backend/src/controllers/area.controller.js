/**
 * Area Controller
 * Handles area/zone management operations
 */

const Area = require('../models/Area');
const { ok, created, notFound, internalError } = require('../utils/response');

/**
 * Get all areas
 * GET /api/areas
 */
const getAreas = async (req, res) => {
  try {
    const areas = await Area.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return ok(res, { areas });
  } catch (error) {
    return internalError(res, error.message);
  }
};

/**
 * Create new area
 * POST /api/areas
 */
const createArea = async (req, res) => {
  try {
    const area = await Area.create(req.body);
    return created(res, { area }, 'Tạo khu vực thành công');
  } catch (error) {
    return internalError(res, error.message);
  }
};

/**
 * Update area
 * PUT /api/areas/:id
 */
const updateArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) return notFound(res, 'Không tìm thấy khu vực');
    return ok(res, { area }, 'Cập nhật khu vực thành công');
  } catch (error) {
    return internalError(res, error.message);
  }
};

/**
 * Delete area (soft delete)
 * DELETE /api/areas/:id
 */
const deleteArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!area) return notFound(res, 'Không tìm thấy khu vực');
    return ok(res, { area }, 'Xóa khu vực thành công');
  } catch (error) {
    return internalError(res, error.message);
  }
};

module.exports = {
  getAreas,
  createArea,
  updateArea,
  deleteArea
};
