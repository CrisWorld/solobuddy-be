const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const travelerGuideFavouriteSchema = mongoose.Schema(
  {
    travelerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    guideId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'TourGuide',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // vì đã có createdAt, không cần updatedAt
  }
);

// đảm bảo 1 traveler không thể favourite cùng 1 guide 2 lần
travelerGuideFavouriteSchema.index({ travelerId: 1, guideId: 1 }, { unique: true });

// add plugins
travelerGuideFavouriteSchema.plugin(toJSON);
travelerGuideFavouriteSchema.plugin(paginate);

/**
 * @typedef TravelerGuideFavourite
 */
const TravelerGuideFavourite = mongoose.model('TravelerGuideFavourite', travelerGuideFavouriteSchema);

module.exports = TravelerGuideFavourite;
