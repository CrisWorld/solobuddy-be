const express = require('express');
const reviewController = require('../../controllers/review.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const reviewValidation = require('../../validations/review.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management for guides
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review for a guide
 *     description: Traveler creates a review for a guide. Requires authentication. TravelerId is taken from JWT.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Booking ID (must exist)
 *               guideId:
 *                 type: string
 *                 description: Guide ID
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 description: Review comment
 *             required:
 *               - bookingId
 *               - guideId
 *               - rating
 *             example:
 *               bookingId: "652b1c2e8f1a2c0012345678"
 *               guideId: "652b1c2e8f1a2c0098765432"
 *               rating: 5
 *               comment: "Great experience!"
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or already reviewed
 *       404:
 *         description: Booking not found
 *
 *   get:
 *     summary: Get reviews for a guide
 *     description: Get paginated reviews for a guide, joined with traveler info (name, email, avatar).
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: guideId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guide ID to filter reviews
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Review'
 *                       - type: object
 *                         properties:
 *                           traveler:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         bookingId:
 *           type: string
 *         guideId:
 *           type: string
 *         travelerId:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
router
  .route('/')
  .post(auth(), validate(reviewValidation.createReview), reviewController.createReview)
  .get(validate(reviewValidation.getReviews), reviewController.getReviews);

module.exports = router;
