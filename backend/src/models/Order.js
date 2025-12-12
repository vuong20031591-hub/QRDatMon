const mongoose = require('mongoose');

const orderItemToppingSchema = new mongoose.Schema({
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

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  combo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Combo'
  },
  itemName: String, // Snapshot tên món
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  note: String,
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  cancelReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  priority: {
    type: Number,
    default: 0
  },
  startedAt: Date,
  completedAt: Date,
  servedAt: Date,
  cancelledAt: Date,
  toppings: [orderItemToppingSchema]
}, { 
  _id: true,
  timestamps: true 
});

const orderSchema = new mongoose.Schema({
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  orderNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  note: String,
  cancelReason: String,
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  items: [orderItemSchema]
}, {
  timestamps: true
});

orderSchema.index({ bill: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'items.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
