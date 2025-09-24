const Joi = require('joi');
const { favourites, specialtyTypes, vehicleTypes, languages, locations } = require('../config/tour-guide');

const updateProfile = {
  body: Joi.object({
    bio: Joi.string().allow(''),
    pricePerDay: Joi.number().min(0),
    location: Joi.string().valid(...locations),
    languages: Joi.array().items(Joi.string().valid(...languages)),
    experienceYears: Joi.number().min(0),
    photos: Joi.array().items(Joi.string().uri()),
    vehicle: Joi.string().valid(...vehicleTypes),
    specialties: Joi.array().items(Joi.string().valid(...specialtyTypes)),
    favourites: Joi.array().items(
      Joi.object({
        name: Joi.string().valid(...favourites),
      })
    ),
  }),
};

const updateAvailableDates = {
  body: Joi.object({
    removeDates: Joi.array().items(Joi.date().iso()).required(),
    addDates: Joi.array().items(Joi.date().iso()).required(),
  }),
};

const updateWorkDays = {
  body: Joi.object({
    isRecur: Joi.boolean().required(),
    dayInWeek: Joi.array().items(Joi.number().min(0).max(6)).required(),
  }),
};

module.exports = {
  updateProfile,
  updateAvailableDates,
  updateWorkDays,
};
