const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getTours = {
  query: Joi.object().keys({
    guideId: Joi.string().custom(objectId),
    title: Joi.string(),
    unit: Joi.string(),
    price: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
  }),
};

const getTour = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const updateTour = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().max(255),
      description: Joi.string().allow(''),
      image: Joi.string().uri(),
      price: Joi.number().min(0),
      unit: Joi.string(),
      duration: Joi.string().max(50),
    })
    .min(1),
};

const deleteTour = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getTours,
  getTour,
  updateTour,
  deleteTour,
};
