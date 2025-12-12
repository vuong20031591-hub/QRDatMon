const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  billNumber: {
    type: String,
    required: true
  },
  guestCount: {
    type: Number,
    default: 1,
    min: 1
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceChargePercent: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceChargeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  vatPercent: {
    type: Number,
    default: 0,
    min: 0
  },
  vatAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['open', 'requesting_payment', 'paid', 'cancelled'],
    default: 'open'
  },
  cancelReason: String,
  openedAt: {
    type: Date,
    default: Date.now
  },
  paymentRequestedAt: Date,
  closedAt: Date
}, {
  timestamps: true
});

billSchema.index({ table: 1, status: 1 });
billSchema.index({ billNumber: 1 }, { unique: true });
billSchema.index({ status: 1 });
billSchema.index({ openedAt: -1 });
billSchema.index({ cashier: 1 });

module.exports = mongoose.model('Bill', billSchema);
