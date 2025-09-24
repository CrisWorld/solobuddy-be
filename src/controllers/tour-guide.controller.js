const httpStatus = require('http-status');
const pick = require('../utils/pick');
const tourGuideService = require('../services/tour-guide.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/booking.model');

/**
 * GET /v1/tour-guides
 * Query tour guides with filter and pagination
 * Query params: page, limit, sortBy, ...filter fields
 */
const getTourGuides = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'user.name',
    'location',
    'languages',
    'ratingAvg',
    'pricePerDay',
    'vehicle',
    'experienceYears',
    'specialties',
    'favourites.name',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (options.populate && !options.populate.includes('user')) {
    options.populate = options.populate.concat('user');
  }
  const result = await tourGuideService.queryTourGuides(filter, options);
  res.status(httpStatus.OK).send(result);
});

// Chỉnh sửa thông tin profile tour guide
const updateProfile = catchAsync(async (req, res) => {
  const { _id: tourGuideId } = req.user.tourGuides[0] || { _id: undefined }; // giả sử đã có auth, lấy từ JWT
  if (!tourGuideId) throw new ApiError(httpStatus.BAD_REQUEST, 'No tour guide found');
  const updateBody = req.body;
  const updated = await tourGuideService.updateProfile(tourGuideId, updateBody);
  res.send(updated);
});

// Chọn ngày rảnh (availableDates) - hỗ trợ thêm/xóa ngày, validate ngày xóa không trùng booking
const updateAvailableDates = catchAsync(async (req, res) => {
  const { tourGuideId } = req.user;
  const { addDates = [], removeDates = [] } = req.body;

  // Kiểm tra các ngày xóa có bị trùng booking không
  let conflictDates = [];
  if (removeDates.length > 0) {
    conflictDates = await Booking.find({
      tourGuideId,
      bookingDate: { $in: removeDates },
    }).distinct('bookingDate');
  }

  if (conflictDates.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Không thể xóa các ngày đã có booking: ${conflictDates.map((d) => d.toISOString().slice(0, 10)).join(', ')}`
    );
  }

  // Lấy availableDates hiện tại
  const tourGuide = await tourGuideService.getById(tourGuideId);
  let currentDates = tourGuide.availableDates || [];

  // Xóa các ngày trong removeDates
  currentDates = currentDates.filter(
    (date) => !removeDates.some((rm) => new Date(date).toISOString() === new Date(rm).toISOString())
  );

  // Thêm các ngày mới (không trùng)
  addDates.forEach((date) => {
    const isoDate = new Date(date).toISOString();
    if (!currentDates.some((d) => new Date(d).toISOString() === isoDate)) {
      currentDates.push(date);
    }
  });

  // Cập nhật lại availableDates
  const updated = await tourGuideService.updateAvailableDates(tourGuideId, currentDates);
  res.send(updated);
});

/**
 * PATCH /v1/tour-guides/work-days
 * Cập nhật ngày làm việc theo tuần (chu kỳ)
 * Body: { isRecur: Boolean, dayInWeek: [Number] }
 */
const updateWorkDays = catchAsync(async (req, res) => {
  const { tourGuideId } = req.user;
  const { isRecur, dayInWeek } = req.body;

  // Validate dayInWeek
  if (!Array.isArray(dayInWeek) || dayInWeek.some((v) => v < 0 || v > 6)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'dayInWeek must be an array of numbers from 0 to 6');
  }

  const updated = await tourGuideService.updateWorkDays(tourGuideId, { isRecur, dayInWeek });
  res.send(updated);
});

module.exports = {
  getTourGuides,
  updateProfile,
  updateAvailableDates,
  updateWorkDays,
};
