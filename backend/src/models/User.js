const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    select: false
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  avatarUrl: String,
  authProvider: {
    type: String,
    enum: ['local', 'google', 'phone'],
    default: 'local'
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
