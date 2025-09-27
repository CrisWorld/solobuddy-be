const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { tourUnit } = require('../config/tour');

const tourSchema = mongoose.Schema(
  {
    guideId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'TourGuide',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: mongoose.SchemaTypes.Decimal128,
      required: true,
      min: 0,
      get: (v) => parseFloat(v.toString()),
      set: (v) => mongoose.Types.Decimal128.fromString(v.toString()),
    },
    unit: {
      type: tourUnit,
      trim: true,
    },
    duration: {
      type: String,
      maxlength: 50,
      trim: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // chỉ có createdAt
    toJSON: { getters: true }, // đảm bảo get price ra number
  }
);

// add plugins
tourSchema.plugin(toJSON);
tourSchema.plugin(paginate);

/**
 * @typedef Tour
 */
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
