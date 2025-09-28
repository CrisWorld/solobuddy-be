const Joi = require('joi');

const createBooking = {
  body: Joi.object({
    tourGuideId: Joi.string().required(),
    tourId: Joi.string().required(),
    fromDate: Joi.date().iso().required(),
    toDate: Joi.date().iso().min(Joi.ref('fromDate')).required(),
    quanity: Joi.number().integer().min(1).required(),
  }),
};

module.exports = {
  createBooking,
};
