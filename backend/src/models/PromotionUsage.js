const mongoose = require('mongoose');

const promotionUsageSchema = new mongoose.Schema({
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

promotionUsageSchema.index({ promotion: 1 });
promotionUsageSchema.index({ user: 1 });
promotionUsageSchema.index({ bill: 1 });

module.exports = mongoose.model('PromotionUsage', promotionUsageSchema);
