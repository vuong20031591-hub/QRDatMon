const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastSentAt: {
    type: Date,
    default: Date.now
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// TTL index - MongoDB sẽ tự động xóa document sau khi expiresAt
// Thêm 5 phút buffer để đảm bảo có thời gian xử lý
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

// Index cho việc tìm kiếm OTP theo phone
otpSchema.index({ phone: 1, isUsed: 1 });

module.exports = mongoose.model('Otp', otpSchema);
