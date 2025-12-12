/**
 * Inventory Model
 * Tracks stock levels for menu items
 * Requirements: 12.1, 12.2
 */

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  unit: {
    type: String,
    default: 'phần',
    trim: true
  },
  autoUpdateStatus: {
    type: Boolean,
    default: true
  },
  lastRestockedAt: {
    type: Date
  },
  lastRestockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

// menuItem already has unique: true which creates an index
inventorySchema.index({ quantity: 1 });

// Virtual to check if low stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minThreshold;
});

// Virtual to check if out of stock
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.quantity <= 0;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
