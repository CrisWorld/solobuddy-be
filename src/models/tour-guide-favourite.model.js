const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tourGuideFavouriteSchema = mongoose.Schema(
  {
    favouriteId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Favourite',
      required: true,
      index: true,
    },
    tourGuideId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'TourGuide',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tourGuideFavouriteSchema.plugin(toJSON);
tourGuideFavouriteSchema.plugin(paginate);

/**
 * @typedef TourGuideFavourite
 */
const TourGuideFavourite = mongoose.model('TourGuideFavourite', tourGuideFavouriteSchema);

module.exports = TourGuideFavourite;
