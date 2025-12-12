const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['waiter', 'cashier', 'kitchen', 'manager', 'admin'],
    required: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

staffSchema.index({ user: 1 }, { unique: true });
staffSchema.index({ role: 1 });
staffSchema.index({ employeeCode: 1 }, { unique: true });

module.exports = mongoose.model('Staff', staffSchema);
