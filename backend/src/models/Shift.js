const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  workDate: {
    type: Date,
    required: true
  },
  startTime: String, // "08:00"
  endTime: String,   // "16:00"
  checkInAt: Date,
  checkOutAt: Date,
  note: String
}, {
  timestamps: true
});

shiftSchema.index({ staff: 1, workDate: 1 });
shiftSchema.index({ workDate: 1 });

module.exports = mongoose.model('Shift', shiftSchema);
