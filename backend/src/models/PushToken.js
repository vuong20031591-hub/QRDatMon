const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['android', 'ios'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

pushTokenSchema.index({ user: 1 });
pushTokenSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model('PushToken', pushTokenSchema);
