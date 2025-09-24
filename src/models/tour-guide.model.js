const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { vehicleTypes, specialtyTypes } = require('../config/tour-guide');
const { favouriteSchema } = require('./favourite.model');

const tourGuideSchema = mongoose.Schema(
  {
    // Reference to User model - TourGuide extends User
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Price per day must be positive');
        }
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    languages: {
      type: [String],
      default: [],
      validate(value) {
        if (value.length === 0) {
          throw new Error('At least one language is required');
        }
      },
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
      validate(value) {
        if (!Number.isInteger(value) || value < 0) {
          throw new Error('Experience years must be a positive integer');
        }
      },
    },
    photos: {
      type: [String],
      default: [],
    },
    vehicle: {
      type: String,
      trim: true,
      maxlength: 100,
      enum: {
        values: vehicleTypes,
        message: 'Invalid vehicle type',
      },
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (value) => Math.round(value * 100) / 100, // Round to 2 decimal places
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Additional useful fields
    isActive: {
      type: Boolean,
      default: true,
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
      enum: {
        values: specialtyTypes,
        message: 'Invalid specialty type',
      },
    },
    favourites: {
      type: [favouriteSchema],
      default: [],
    },
    isRecur: {
      type: Boolean,
      default: false,
    },
    dayInWeek: {
      type: [Number], // 0: Chủ nhật, 1: Thứ hai, ..., 6: Thứ bảy
      default: [],
      validate(value) {
        if (!Array.isArray(value) || value.some((v) => v < 0 || v > 6)) {
          throw new Error('dayInWeek must be an array of numbers from 0 to 6');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
tourGuideSchema.plugin(toJSON);
tourGuideSchema.plugin(paginate);

// Indexes for better query performance
tourGuideSchema.index({ location: 1 });
tourGuideSchema.index({ pricePerDay: 1 });
tourGuideSchema.index({ ratingAvg: -1 });
tourGuideSchema.index({ languages: 1 });
tourGuideSchema.index({ isActive: 1 });

/**
 * Check if tour guide exists by userId
 * @param {ObjectId} userId - The user's id
 * @param {ObjectId} [excludeTourGuideId] - The id of the tour guide to be excluded
 * @returns {Promise<boolean>}
 */
tourGuideSchema.statics.existsByUserId = async function (userId, excludeTourGuideId) {
  const tourGuide = await this.findOne({
    userId,
    _id: { $ne: excludeTourGuideId },
  });
  return !!tourGuide;
};

/**
 * Get tour guides by location
 * @param {string} location - Location to search
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
tourGuideSchema.statics.getByLocation = async function (location, options = {}) {
  const filter = {
    location: new RegExp(location, 'i'),
    isActive: true,
  };
  return this.paginate(filter, options);
};

/**
 * Get tour guides by price range
 * @param {number} minPrice - Minimum price per day
 * @param {number} maxPrice - Maximum price per day
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
tourGuideSchema.statics.getByPriceRange = async function (minPrice, maxPrice, options = {}) {
  const filter = {
    pricePerDay: { $gte: minPrice, $lte: maxPrice },
    isActive: true,
  };
  return this.paginate(filter, options);
};

/**
 * Get top rated tour guides
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
tourGuideSchema.statics.getTopRated = async function (options = {}) {
  const filter = {
    isActive: true,
    ratingCount: { $gte: 5 }, // At least 5 ratings
  };
  const queryOptions = {
    ...options,
    sort: { ratingAvg: -1, ratingCount: -1 },
  };
  return this.paginate(filter, queryOptions);
};

/**
 * Update rating for tour guide
 * @param {number} newRating - New rating (1-5)
 * @returns {Promise<void>}
 */
tourGuideSchema.methods.updateRating = async function (newRating) {
  const tourGuide = this;

  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const totalRating = tourGuide.ratingAvg * tourGuide.ratingCount + newRating;
  tourGuide.ratingCount += 1;
  tourGuide.ratingAvg = Math.round((totalRating / tourGuide.ratingCount) * 100) / 100;

  await tourGuide.save();
};

/**
 * Get available tour guides by date
 * @param {Date} date - Date to check availability
 * @param {string} location - Location filter (optional)
 * @returns {Promise<Array>}
 */
tourGuideSchema.statics.getAvailableByDate = async function (date, location = null) {
  const filter = {
    isActive: true,
    availableDates: date,
  };

  if (location) {
    filter.location = new RegExp(location, 'i');
  }

  return this.find(filter).populate('userId', 'name email avatar phone');
};

// Virtual for populating user data
tourGuideSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtual fields are serialized
tourGuideSchema.set('toJSON', { virtuals: true });
tourGuideSchema.set('toObject', { virtuals: true });

/**
 * @typedef TourGuide
 */
const TourGuide = mongoose.model('TourGuide', tourGuideSchema);

module.exports = TourGuide;
