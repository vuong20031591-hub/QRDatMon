const mongoose = require('mongoose');

const comboItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  isRequired: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const comboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: String,
  imageUrl: String,
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  comboPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: Date,
  endDate: Date,
  maxQuantityPerOrder: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  items: [comboItemSchema]
}, {
  timestamps: true
});

comboSchema.index({ isActive: 1 });
comboSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Combo', comboSchema);
