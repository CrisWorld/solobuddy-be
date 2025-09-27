/**
 * @swagger
 * tags:
 *   name: TourGuides
 *   description: Quản lý tour guide
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

/**
 * @swagger
 * /tour-guides:
 *   post:
 *     summary: Lấy danh sách tour guide (filter nâng cao, phân trang)
 *     tags: [TourGuides]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *                   properties:
 *                     operator:
 *                       type: string
 *                       description: MongoDB operator
 *                     value:
 *                       description: Giá trị cho operator
 *               options:
 *                 type: object
 *                 properties:
 *                   sortBy:
 *                     type: string
 *                   limit:
 *                     type: integer
 *                   page:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Danh sách tour guide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TourGuide'
 *                 totalResults:
 *                   type: integer
 */

/**
 * @swagger
 * /tour-guides/tour:
 *   post:
 *     summary: Tạo mới tour cho tour guide
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tour đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không tìm thấy tour guide
 */
/**
 * @swagger
 * /tour-guides/detail/{id}:
 *   get:
 *     summary: Lấy chi tiết tour guide
 *     description: Trả về thông tin chi tiết của một tour guide theo ID.
 *     tags: [TourGuides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour guide ID
 *     responses:
 *       200:
 *         description: Thông tin chi tiết tour guide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TourGuide'
 *       404:
 *         description: Không tìm thấy tour guide
 */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tourGuideController = require('../../controllers/tour-guide.controller');
const tourGuideValidation = require('../../validations/tour-guide.validation');

const router = express.Router();

router.patch(
  '/profile',
  auth('updateTourGuide'),
  validate(tourGuideValidation.updateProfile),
  tourGuideController.updateProfile
);

router.get('/detail/:id', tourGuideController.getTourGuideDetail);

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

router.post(
  '/',
  // auth('getTourGuides'), // Bỏ comment nếu cần bảo vệ
  validate(tourGuideValidation.listTourGuides),
  tourGuideController.listTourGuides
);

router.post('/tour', auth(), validate(tourGuideValidation.createTour), tourGuideController.createTour);

module.exports = router;
