const catchAsync = require('../utils/catchAsync');
const reviewService = require('../services/review.service');

const createReview = catchAsync(async (req, res) => {
  const travelerId = req.user._id;
  const review = await reviewService.createReview(req.body, travelerId);
  res.status(201).send(review);
});

const getReviews = catchAsync(async (req, res) => {
  const { guideId, page, limit } = req.query;
  const result = await reviewService.getReviewsByGuide(guideId, { page, limit });
  res.send(result);
});

module.exports = {
  createReview,
  getReviews,
};
