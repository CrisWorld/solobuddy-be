const express = require('express');
const bookingController = require('../../controllers/booking.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const bookingValidation = require('../../validations/booking.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking
 *     description: Traveler books a tour guide for a date range. Validate working days (by isRecur/dayInWeek or availableDates) and prevent double booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourGuideId:
 *                 type: string
 *                 description: Tour guide ID
 *               tourId:
 *                 type: string
 *                 description: Tour ID
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 description: Start date (ISO format)
 *               toDate:
 *                 type: string
 *                 format: date
 *                 description: End date (ISO format)
 *               quanity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of travelers
 *             required:
 *               - tourGuideId
 *               - tourId
 *               - fromDate
 *               - toDate
 *               - quanity
 *             example:
 *               tourGuideId: "652b1c2e8f1a2c0012345678"
 *               tourId: "652b1c2e8f1a2c0098765432"
 *               fromDate: "2025-10-01"
 *               toDate: "2025-10-03"
 *               quanity: 2
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid booking dates or already booked
 *       404:
 *         description: Tour guide not found
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings for current user/guide
 *     description: |
 *       - Nếu role là `user`, trả về các booking của travelerId hiện tại.
 *       - Nếu role là `guide`, trả về các booking của tourGuideId hiện tại.
 *       - Kết quả được sắp xếp theo thời gian tạo mới nhất (createdAt desc).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         travelerId:
 *           type: string
 *         tourGuideId:
 *           type: string
 *         tourId:
 *           type: string
 *         fromDate:
 *           type: string
 *           format: date
 *         toDate:
 *           type: string
 *           format: date
 *         quanity:
 *           type: integer
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

router
  .post('/', auth(), validate(bookingValidation.createBooking), bookingController.createBooking)
  .get('/', auth(), bookingController.getBookings);
module.exports = router;
