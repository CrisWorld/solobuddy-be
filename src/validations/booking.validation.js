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

const updateBookingStatus = {
  params: Joi.object().keys({
    bookingId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('completed', 'cancelled', 'confirmed').required(),
  }),
};

module.exports = {
  createBooking,
  updateBookingStatus,
};
