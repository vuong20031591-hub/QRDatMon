const mongoose = require('mongoose');
const crypto = require('crypto');

const tableSchema = new mongoose.Schema({
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  tableNumber: {
    type: String,
    required: true,
    trim: true
  },
  qrCodeUrl: String,
  qrToken: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  capacity: {
    type: Number,
    default: 4,
    min: 1
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

tableSchema.index({ area: 1 });
tableSchema.index({ qrToken: 1 }, { unique: true });
tableSchema.index({ status: 1 });
tableSchema.index({ tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
