const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { bookingStatuses } = require('../config/booking');

const bookingSchema = mongoose.Schema(
  {
    travelerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tourGuideId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'TourGuide',
      required: true,
      index: true,
    },
    tourId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Tour',
      required: true,
      index: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: bookingStatuses,
      default: bookingStatuses[0],
    },
    quanity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: mongoose.SchemaTypes.Decimal128,
      required: true,
      min: 0,
      get: (v) => parseFloat(v.toString()),
      set: (v) => mongoose.Types.Decimal128.fromString(v.toString()),
    },

    /**
     * Snapshot fields để log lại thông tin có thể thay đổi theo thời gian
     */
    tourSnapshot: {
      id: mongoose.SchemaTypes.ObjectId,
      title: String,
      price: Number,
      unit: String,
      duration: String,
    },
    guideSnapshot: {
      id: mongoose.SchemaTypes.ObjectId,
      name: String,
      email: String,
      pricePerDay: Number,
      phone: String,
      country: String,
      location: String,
    },
    travelerSnapshot: {
      id: mongoose.SchemaTypes.ObjectId,
      name: String,
      email: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { getters: true },
  }
);

// add plugins
bookingSchema.plugin(toJSON);
bookingSchema.plugin(paginate);

/**
 * @typedef Booking
 */
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
