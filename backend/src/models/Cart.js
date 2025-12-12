const mongoose = require('mongoose');

const cartItemToppingSchema = new mongoose.Schema({
  toppingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  toppingGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: String,
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: true });

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  combo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Combo'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  note: String,
  toppings: [cartItemToppingSchema]
}, { 
  _id: true,
  timestamps: true 
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

cartSchema.index({ user: 1, table: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
