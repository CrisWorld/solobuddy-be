const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const favouriteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    imgUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
favouriteSchema.plugin(toJSON);
favouriteSchema.plugin(paginate);

/**
 * @typedef Favourite
 */
const Favourite = mongoose.model('Favourite', favouriteSchema);

module.exports = {
  favouriteSchema,
  Favourite,
};
