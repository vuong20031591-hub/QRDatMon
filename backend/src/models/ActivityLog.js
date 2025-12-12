const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'cancel', 'confirm'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['order', 'order_item', 'bill', 'menu_item', 'table', 'staff'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  oldData: mongoose.Schema.Types.Mixed,
  newData: mongoose.Schema.Types.Mixed,
  ipAddress: String
}, {
  timestamps: true
});

activityLogSchema.index({ staff: 1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
