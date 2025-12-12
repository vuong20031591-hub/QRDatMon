const mongoose = require('mongoose');

const itemReviewSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, { _id: true });

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  foodRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ambianceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  averageRating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  itemReviews: [itemReviewSchema]
}, {
  timestamps: true
});

// Calculate average rating before save
reviewSchema.pre('save', function(next) {
  this.averageRating = (this.foodRating + this.serviceRating + this.ambianceRating) / 3;
  this.averageRating = Math.round(this.averageRating * 10) / 10;
  next();
});

reviewSchema.index({ user: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ bill: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ averageRating: -1 });
reviewSchema.index({ 'itemReviews.menuItem': 1 });

module.exports = mongoose.model('Review', reviewSchema);
