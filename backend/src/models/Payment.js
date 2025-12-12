const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['cash', 'qr_banking', 'card', 'momo', 'zalopay'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  qrCodeUrl: String,
  bankCode: String,
  bankName: String,
  paymentDetails: mongoose.Schema.Types.Mixed,
  note: String,
  paidAt: Date
}, {
  timestamps: true
});

paymentSchema.index({ bill: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ method: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
