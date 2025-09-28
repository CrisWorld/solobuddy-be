const dayjs = require('dayjs');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const Booking = require('../models/booking.model');
const TourGuide = require('../models/tour-guide.model');
const ApiError = require('../utils/ApiError');
const { Tour } = require('../models');

function getDateRange(fromDate, toDate) {
  const start = dayjs(fromDate);
  const end = dayjs(toDate);
  const dates = [];

  let current = start;
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.toDate()); // hoặc current.format('YYYY-MM-DD')
    current = current.add(1, 'day');
  }

  return dates;
}

const createBooking = async (bookingBody, travelerId, req) => {
  const { tourGuideId, tourId, fromDate, toDate, quanity } = bookingBody;
  const tour = await Tour.findById(tourId);
  if (!tour) throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  // Lấy tour guide
  const tourGuide = await TourGuide.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(tourGuideId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        pricePerDay: 1,
        isRecur: 1,
        dayInWeek: 1,
        availableDates: 1,
        location: 1,
        user: {
          _id: 1,
          name: 1,
          email: 1,
          country: 1,
          phone: 1,
        },
      },
    },
  ]);
  if (!tourGuide.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tour guide not found');
  }
  const guide = tourGuide[0]; // dùng guide thay vì tourGuide

  // Tạo mảng ngày booking
  const bookingDates = getDateRange(fromDate, toDate);

  // Validate ngày làm việc
  if (guide.isRecur && Array.isArray(guide.dayInWeek)) {
    // Theo chu kỳ dayInWeek
    const invalidDays = bookingDates.filter((date) => !guide.dayInWeek.includes(date.getDay()));
    if (invalidDays.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Some booking dates are not in tour guide's working days");
    }
  } else if (!guide.isRecur && Array.isArray(guide.availableDates)) {
    // Theo availableDates
    const availableSet = new Set(guide.availableDates.map((d) => new Date(d).toISOString().slice(0, 10)));
    const invalidDays = bookingDates.filter((date) => !availableSet.has(date.toISOString().slice(0, 10)));
    if (invalidDays.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Some booking dates are not available for this tour guide');
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tour guide schedule is not set properly');
  }

  // Kiểm tra trùng ngày đã được booked
  const overlapBookings = await Booking.find({
    tourGuideId,
    status: { $ne: 'cancelled' },
    $or: [
      {
        fromDate: { $lte: toDate },
        toDate: { $gte: fromDate },
      },
    ],
  });
  if (overlapBookings.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Some booking dates are already booked');
  }
  const totalDays = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
  const totalPrice = tour.price * quanity + totalDays * guide.pricePerDay;

  // Tạo booking
  const booking = await Booking.create({
    travelerId,
    tourGuideId,
    tourId,
    totalPrice,
    fromDate,
    toDate,
    quanity,
    travelerSnapshot: {
      id: travelerId,
      name: req.user.name,
      email: req.user.email,
    },
    tourSnapshot: {
      id: tourId,
      title: tour.title,
      price: tour.price,
      unit: tour.unit,
      duration: tour.duration,
    },
    guideSnapshot: {
      id: tourGuideId,
      name: guide.name,
      email: guide.email,
      phone: guide.user.phone,
      country: guide.user.country,
      location: guide.location,
      pricePerDay: guide.pricePerDay,
    },
  });

  return booking;
};

module.exports = {
  createBooking,
};
