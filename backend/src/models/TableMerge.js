const mongoose = require('mongoose');

const tableMergeSchema = new mongoose.Schema({
  mainTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  mergedTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  mergedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  mergedAt: {
    type: Date,
    default: Date.now
  },
  unmergedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  unmergedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

tableMergeSchema.index({ mainTable: 1, isActive: 1 });
tableMergeSchema.index({ mergedTable: 1, isActive: 1 });

module.exports = mongoose.model('TableMerge', tableMergeSchema);
