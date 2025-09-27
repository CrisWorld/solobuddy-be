const httpStatus = require('http-status');
const Tour = require('../models/tour.model');
const ApiError = require('../utils/ApiError');

/**
 * Query tours with filter & pagination
 */
const queryTours = async (filter, options) => {
  const newFilter = { ...filter, deleted: { $ne: true } }; // chỉ lấy tour chưa bị xóa mềm
  return Tour.paginate(newFilter, options);
};

/**
 * Lấy tour theo id
 */
const getById = async (id) => {
  return Tour.findById(id);
};

/**
 * Cập nhật tour
 */
const updateTour = async (id, updateBody) => {
  const tour = await Tour.findById(id);
  if (!tour || tour.deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  Object.assign(tour, updateBody);
  await tour.save();
  return tour;
};

/**
 * Xóa mềm tour
 */
const softDeleteTour = async (id) => {
  const tour = await Tour.findById(id);
  if (!tour || tour.deleted) throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  tour.deleted = true;
  await tour.save();
};

const createTour = async (tourData) => {
  return Tour.create(tourData);
};

module.exports = {
  queryTours,
  getById,
  updateTour,
  softDeleteTour,
  createTour,
};
