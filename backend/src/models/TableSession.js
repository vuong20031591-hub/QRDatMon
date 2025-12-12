const mongoose = require('mongoose');

const tableSessionSchema = new mongoose.Schema({
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
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

tableSessionSchema.index({ user: 1, isActive: 1 });
tableSessionSchema.index({ table: 1, isActive: 1 });
tableSessionSchema.index({ bill: 1 });

module.exports = mongoose.model('TableSession', tableSessionSchema);
