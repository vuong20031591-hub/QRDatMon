const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string'
  }
}, {
  timestamps: true
});

settingSchema.index({ key: 1 }, { unique: true });

// Static method to get setting value
settingSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting value
settingSchema.statics.setValue = async function(key, value, type = 'string', description = '') {
  return this.findOneAndUpdate(
    { key },
    { value, type, description },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Setting', settingSchema);
