const httpStatus = require('http-status');
const pick = require('../utils/pick');
const tourGuideService = require('../services/tour-guide.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');

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
  const userUpdate = {};
  if (!tourGuideId) throw new ApiError(httpStatus.BAD_REQUEST, 'No tour guide found');
  const updateBody = req.body;
  if (updateBody.country) {
    userUpdate.country = updateBody.country;
    delete updateBody.country;
  }
  if (updateBody.phone) {
    userUpdate.phone = updateBody.phone;
    delete updateBody.phone;
  }
  await User.findByIdAndUpdate(req.user._id, userUpdate, { new: true });
  const updated = await tourGuideService.updateProfile(tourGuideId, updateBody);
  res.send(updated);
});

// Chọn ngày rảnh (availableDates) - hỗ trợ thêm/xóa ngày, validate ngày xóa không trùng booking
const updateAvailableDates = catchAsync(async (req, res) => {
  const { _id: tourGuideId } = req.user.tourGuides[0] || { _id: undefined }; // giả sử đã có auth, lấy từ JWT
  const { addDates = [], removeDates = [] } = req.body;
  if (!tourGuideId) throw new ApiError(httpStatus.BAD_REQUEST, 'No tour guide found');
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
  const { _id: tourGuideId } = req.user.tourGuides[0] || { tourGuideId: undefined }; // giả sử đã có auth, lấy từ JWT
  const { isRecur, dayInWeek } = req.body;
  if (!tourGuideId) throw new ApiError(httpStatus.BAD_REQUEST, 'No tour guide found');

  const updated = await tourGuideService.updateWorkDays(tourGuideId, { isRecur, dayInWeek });
  res.send(updated);
});

/**
 * LIST /v1/tour-guides
 * Query tour guides with filter and pagination
 * Body: { filter: {}, options: {} }
 */
const listTourGuides = catchAsync(async (req, res) => {
  const { filter = {}, options = {} } = req.body;
  // Chuyển đổi filter sang dạng phù hợp cho queryTourGuides
  const mongoFilter = {};
  Object.keys(filter).forEach((field) => {
    const { operator, value } = filter[field];
    mongoFilter[field.replace('_', '.')] = { [operator]: value };
  });
  const result = await tourGuideService.queryTourGuides(mongoFilter, options);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getTourGuides,
  updateProfile,
  updateAvailableDates,
  updateWorkDays,
  listTourGuides,
};
