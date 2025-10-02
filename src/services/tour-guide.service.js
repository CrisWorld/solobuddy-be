// Service: Get list of tour guides with filter and pagination
const dayjs = require('dayjs');
const { bookingStatuses } = require('../config/booking');
const Booking = require('../models/booking.model');
const TourGuide = require('../models/tour-guide.model');

const queryTourGuides = async (filter, options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  const pipeline = [];

  // base filter (ngoại trừ user.name)
  const baseFilter = { ...filter };
  delete baseFilter['user.name'];
  delete baseFilter['user.country'];

  if (Object.keys(baseFilter).length > 0) {
    pipeline.push({ $match: baseFilter });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' } // inner join
  );

  // nếu có filter theo user.name thì thêm điều kiện match
  if (filter['user.name']) {
    const regex = filter['user.name'].$regex || filter['user.name'];
    if (filter['user.name'].$regex) {
      pipeline.push({
        $match: {
          'user.name': { $regex: regex, $options: 'i' },
        },
      });
    } else {
      pipeline.push({
        $match: {
          'user.name': filter['user.name'],
        },
      });
    }
  }

  if (filter['user.country']) {
    pipeline.push({
      $match: {
        'user.country': filter['user.country'],
      },
    });
  }

  // chỉ lấy name, email, phone của user, lấy hết của tour guide
  pipeline.push({
    $project: {
      ...Object.fromEntries(Object.keys(TourGuide.schema.paths).map((key) => [key, 1])),
      'user.name': 1,
      'user.email': 1,
      'user.country': 1,
      'user.phone': 1,
      'user.avatar': 1,
    },
  });

  // sort
  let sort = { createdAt: -1 };
  if (options.sortBy) {
    sort = {};
    options.sortBy.split(',').forEach((sortOption) => {
      const [key, order] = sortOption.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
  }

  pipeline.push({ $sort: sort });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const results = await TourGuide.aggregate(pipeline);

  // total count
  const countPipeline = [...pipeline];
  countPipeline.pop(); // bỏ $limit
  countPipeline.pop(); // bỏ $skip
  countPipeline.pop(); // bỏ $sort
  const totalResults = (await TourGuide.aggregate(countPipeline)).length;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Create a new tour guide
 * @param {Object} tourGuideBody
 * @returns {Promise<TourGuide>}
 */
const createTourGuide = async (tourGuideBody) => {
  return TourGuide.create(tourGuideBody);
};

/**
 * Get all booked dates for a tour guide
 * @param {ObjectId} tourGuideId
 * @returns {Promise<Date[]>}
 */
const getBookedDatesByTourGuide = async (tourGuideId) => {
  const bookings = await Booking.find({
    tourGuideId,
    status: { $nin: [bookingStatuses[3], bookingStatuses[4]] },
    fromDate: { $gt: new Date() },
  });
  const dates = [];
  bookings.forEach((booking) => {
    let current = dayjs(booking.fromDate);
    const end = dayjs(booking.toDate);
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.toDate());
      current = current.add(1, 'day');
    }
  });
  return dates.sort((a, b) => new Date(a) - new Date(b));
};

const updateProfile = async (tourGuideId, updateBody) => {
  // Chỉ cho phép update các trường sau
  const allowedFields = [
    'bio',
    'pricePerDay',
    'location',
    'languages',
    'experienceYears',
    'photos',
    'vehicle',
    'specialties',
    'favourites',
  ];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (updateBody[field] !== undefined) updateData[field] = updateBody[field];
  });
  return TourGuide.findByIdAndUpdate(tourGuideId, updateData, { new: true });
};

const updateAvailableDates = async (tourGuideId, availableDates) => {
  return TourGuide.findByIdAndUpdate(tourGuideId, { availableDates }, { new: true });
};

const updateWorkDays = async (tourGuideId, { isRecur, dayInWeek }) => {
  return TourGuide.findByIdAndUpdate(tourGuideId, { isRecur, dayInWeek }, { new: true });
};

const getById = async (id) => {
  return TourGuide.findById(id);
};

module.exports = {
  queryTourGuides,
  getById,
  createTourGuide,
  updateProfile,
  updateAvailableDates,
  updateWorkDays,
  getBookedDatesByTourGuide,
};
