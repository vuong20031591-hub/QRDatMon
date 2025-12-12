const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  extraPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { _id: true });

const toppingGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  minSelect: {
    type: Number,
    default: 0,
    min: 0
  },
  maxSelect: {
    type: Number,
    default: 1,
    min: 1
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  toppings: [toppingSchema]
}, { _id: true });

const menuItemSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: String,
  imageUrl: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    default: 'phần',
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'out_of_stock', 'suspended'],
    default: 'available'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number, // minutes
    default: 15
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  toppingGroups: [toppingGroupSchema]
}, {
  timestamps: true
});

menuItemSchema.index({ category: 1 });
menuItemSchema.index({ status: 1 });
menuItemSchema.index({ isPopular: 1 });
menuItemSchema.index({ isNew: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
