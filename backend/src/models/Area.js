const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: String,
  floor: {
    type: Number,
    default: 1
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

areaSchema.index({ sortOrder: 1 });
areaSchema.index({ isActive: 1 });

module.exports = mongoose.model('Area', areaSchema);
