const mongoose = require('mongoose');

const printerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    default: 9100
  },
  type: {
    type: String,
    enum: ['receipt', 'kitchen', 'label'],
    required: true
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

printerSchema.index({ type: 1 });
printerSchema.index({ area: 1 });
printerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Printer', printerSchema);
