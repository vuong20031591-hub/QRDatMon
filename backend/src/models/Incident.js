const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  type: {
    type: String,
    enum: ['returned', 'wrong_order', 'quality_issue', 'delay', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  },
  resolution: String,
  reportedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
}, {
  timestamps: true
});

incidentSchema.index({ order: 1 });
incidentSchema.index({ orderItemId: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ reportedAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
