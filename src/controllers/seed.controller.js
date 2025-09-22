const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const tourGuideService = require('../services/tour-guide.service');
const { specialtyTypes } = require('../config/tour-guide');

// Tạo 10 user và 10 tour guide gắn với từng user
const seedTourGuides = catchAsync(async (req, res) => {
  // Tạo 10 user
  await userService.deleteAllUserAndTourGuide();
  const userBodies = Array.from({ length: 10 }, (_, i) => ({
    name: `Tour Guide ${i + 1}`,
    email: `tourguide${i + 1}@example.com`,
    password: 'Password123!',
    role: 'guide',
    isEmailVerified: true,
  }));
  const users = await Promise.all(userBodies.map((body) => userService.createUser(body)));

  // Tạo 10 tour guide, mỗi ông gắn với 1 user
  const tourGuideBodies = users.map((user, i) => ({
    userId: user.id,
    bio: `Bio for tour guide ${i + 1}`,
    pricePerDay: 100 + i * 10,
    location: 'vietnam',
    languages: ['english'],
    experienceYears: 1 + i,
    photos: [],
    vehicle: 'car',
    specialties: [specialtyTypes[i % specialtyTypes.length]],
    availableDates: [],
  }));
  const tourGuides = await Promise.all(tourGuideBodies.map((body) => tourGuideService.createTourGuide(body)));

  res.status(httpStatus.CREATED).send({ users, tourGuides });
});

module.exports = {
  seedTourGuides,
};
