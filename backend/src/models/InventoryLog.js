/**
 * Inventory Log Model
 * Tracks all inventory changes for auditing
 * Requirements: 12.2
 */

const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  action: {
    type: String,
    enum: ['add', 'deduct', 'adjust', 'restock'],
    required: true
  },
  quantityBefore: {
    type: Number,
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  quantityAfter: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  reference: {
    type: {
      type: String,
      enum: ['order', 'manual', 'adjustment', 'restock']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

inventoryLogSchema.index({ inventory: 1 });
inventoryLogSchema.index({ menuItem: 1 });
inventoryLogSchema.index({ action: 1 });
inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ 'reference.type': 1, 'reference.id': 1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
