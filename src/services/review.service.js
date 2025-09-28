const { Types } = require('mongoose');
const httpStatus = require('http-status');
const Review = require('../models/review.model');
const Booking = require('../models/booking.model');
const ApiError = require('../utils/ApiError');

const createReview = async (reviewBody, travelerId) => {
  // Kiểm tra bookingId tồn tại
  const booking = await Booking.findOne({
    _id: Types.ObjectId(reviewBody.bookingId),
    travelerId: Types.ObjectId(travelerId),
  });
  if (!booking) throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  // Kiểm tra travelerId đã review chưa
  const existed = await Review.findOne({
    bookingId: Types.ObjectId(reviewBody.bookingId),
    travelerId: Types.ObjectId(travelerId),
  });
  if (existed) throw new ApiError(httpStatus.BAD_REQUEST, 'You already reviewed this booking');
  // Tạo review
  return Review.create({ ...reviewBody, travelerId });
};

const getReviewsByGuide = async (guideId, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const reviews = await Review.aggregate([
    { $match: { guideId: Types.ObjectId(guideId) } },
    {
      $lookup: {
        from: 'users', // collection name trong MongoDB
        localField: 'travelerId', // field trong Review
        foreignField: '_id', // field trong User
        as: 'traveler', // tên trường kết quả
      },
    },
    { $unwind: '$traveler' },
    {
      $project: {
        _id: 1,
        rating: 1,
        comment: 1,
        images: 1,
        traveler: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
        },
        createdAt: 1,
      },
    },
  ])
    .skip((page - 1) * limit)
    .limit(limit)
    .sort('-createdAt');
  const totalResults = await Review.countDocuments({ guideId });
  return {
    results: reviews,
    page,
    limit,
    totalResults,
    totalPages: Math.ceil(totalResults / limit),
  };
};

module.exports = {
  createReview,
  getReviewsByGuide,
};
