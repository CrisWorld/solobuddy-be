const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userBadgeSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// unique index để 1 user không được gán cùng 1 badge nhiều lần
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

userBadgeSchema.plugin(toJSON);
userBadgeSchema.plugin(paginate);

/**
 * @typedef UserBadge
 */
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = UserBadge;
