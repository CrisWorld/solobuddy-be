/**
 * @swagger
 * tags:
 *   name: TourGuides
 *   description: Quản lý tour guide
 */

/**
 * @swagger
 * /tour-guides:
 *   get:
 *     summary: Lấy danh sách tour guide (filter, phân trang)
 *     tags: [TourGuides]
 *     parameters:
 *       - in: query
 *         name: user.name
 *         schema:
 *           type: string
 *         description: Tên user
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: languages
 *         schema:
 *           type: string
 *       - in: query
 *         name: ratingAvg
 *         schema:
 *           type: number
 *       - in: query
 *         name: pricePerDay
 *         schema:
 *           type: number
 *       - in: query
 *         name: vehicle
 *         schema:
 *           type: string
 *       - in: query
 *         name: experienceYears
 *         schema:
 *           type: number
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: string
 *       - in: query
 *         name: favourites.name
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Trường sắp xếp, ví dụ "createdAt:desc"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách tour guide
 */

/**
 * @swagger
 * /tour-guides/profile:
 *   patch:
 *     summary: Tour guide cập nhật thông tin profile
 *     tags: [TourGuides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               pricePerDay:
 *                 type: number
 *               location:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceYears:
 *                 type: number
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               vehicle:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               favourites:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Thông tin profile đã cập nhật
 */

/**
 * @swagger
 * /tour-guides/available-dates:
 *   patch:
 *     summary: Tour guide cập nhật ngày rảnh (availableDates)
 *     tags: [TourGuides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addDates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *               removeDates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *               weeklyRecurring:
 *                 type: object
 *                 properties:
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                   from:
 *                     type: string
 *                     format: date
 *                   to:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Danh sách ngày rảnh đã cập nhật
 *       400:
 *         description: Không thể xóa các ngày đã có booking
 */

/**
 * @swagger
 * /tour-guides/work-days:
 *   patch:
 *     summary: Tour guide cập nhật ngày làm việc trong tuần (chu kỳ)
 *     tags: [TourGuides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRecur:
 *                 type: boolean
 *               dayInWeek:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 6
 *     responses:
 *       200:
 *         description: Ngày làm việc đã cập nhật
 */

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tourGuideController = require('../../controllers/tour-guide.controller');
const tourGuideValidation = require('../../validations/tour-guide.validation');

const router = express.Router();

router.get('/', tourGuideController.getTourGuides);

router.patch(
  '/profile',
  auth('updateTourGuide'),
  validate(tourGuideValidation.updateProfile),
  tourGuideController.updateProfile
);

router.patch(
  '/available-dates',
  auth('updateTourGuide'),
  validate(tourGuideValidation.updateAvailableDates),
  tourGuideController.updateAvailableDates
);

router.patch(
  '/work-days',
  auth('updateTourGuide'),
  validate(tourGuideValidation.updateWorkDays),
  tourGuideController.updateWorkDays
);

module.exports = router;
