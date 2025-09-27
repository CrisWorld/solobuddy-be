const Joi = require('joi');

const createReview = {
  body: Joi.object({
    bookingId: Joi.number().required(),
    guideId: Joi.number().required(),
    rating: Joi.number().min(1).max(5).required(),
    images: Joi.array().items(Joi.string().uri()),
    comment: Joi.string().allow(''),
  }),
};

const getReviews = {
  query: Joi.object({
    guideId: Joi.number().required(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
  }),
};

module.exports = {
  createReview,
  getReviews,
};
