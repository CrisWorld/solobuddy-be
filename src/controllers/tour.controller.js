const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const tourService = require('../services/tour.service');

/**
 * GET /v1/tours
 * Lấy danh sách tour với filter, phân trang
 */
const getTours = catchAsync(async (req, res) => {
  // Nhận filter từ body, fallback về {}
  const filter = req.body.filter || {};
  // Nhận options từ body, fallback về {}
  const options = req.body.options || {};
  const result = await tourService.queryTours(filter, options);
  res.status(httpStatus.OK).send(result);
});
/**
 * GET /v1/tours/:id
 * Xem chi tiết tour
 */
const getTour = catchAsync(async (req, res) => {
  const tour = await tourService.getById(req.params.id);
  if (!tour || tour.deleted) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tour not found');
  }
  res.send(tour);
});

/**
 * PATCH /v1/tours/:id
 * Cập nhật thông tin tour
 */
const updateTour = catchAsync(async (req, res) => {
  const updated = await tourService.updateTour(req.params.id, req.body);
  res.send(updated);
});

/**
 * DELETE /v1/tours/:id
 * Xóa mềm tour
 */
const deleteTour = catchAsync(async (req, res) => {
  await tourService.softDeleteTour(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getTours,
  getTour,
  updateTour,
  deleteTour,
};
