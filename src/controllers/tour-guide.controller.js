const httpStatus = require('http-status');
const pick = require('../utils/pick');
const tourGuideService = require('../services/tour-guide.service');
const catchAsync = require('../utils/catchAsync');

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

module.exports = {
  getTourGuides,
};
