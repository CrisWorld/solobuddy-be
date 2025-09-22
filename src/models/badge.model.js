const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const badgeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    iconUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

badgeSchema.plugin(toJSON);
badgeSchema.plugin(paginate);

/**
 * @typedef Badge
 */
const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
