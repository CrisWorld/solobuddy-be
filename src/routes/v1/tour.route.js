const express = require('express');
const tourController = require('../../controllers/tour.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tourValidation = require('../../validations/tour.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: Tour management and retrieval
 */

/**
 * @swagger
 * /tours:
 *   post:
 *     summary: Get list of tours (dynamic filter)
 *     description: Retrieve a paginated list of tours using a dynamic MongoDB filter and options sent in the request body.
 *     tags: [Tours]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *                 description: Dynamic MongoDB filter object
 *               options:
 *                 type: object
 *                 description: Pagination, sorting, and populate options
 *             example:
 *               filter:
 *                 price: { "$gte": 100 }
 *                 guideId: "abc123"
 *               options:
 *                 sortBy: "price:desc"
 *                 limit: 10
 *                 page: 1
 *                 populate: "guide"
 *     responses:
 *       200:
 *         description: List of tours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tour'
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
 * /tours/{id}:
 *   get:
 *     summary: Get tour detail
 *     description: Retrieve details of a specific tour by ID.
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Tour detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       404:
 *         description: Tour not found
 *
 *   patch:
 *     summary: Update tour
 *     description: Update information of a specific tour. Requires authentication.
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TourUpdate'
 *     responses:
 *       200:
 *         description: Updated tour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       404:
 *         description: Tour not found
 *
 *   delete:
 *     summary: Soft delete tour
 *     description: Mark a tour as deleted (soft delete). Requires authentication.
 *     tags: [Tours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       204:
 *         description: Tour deleted successfully
 *       404:
 *         description: Tour not found
 */

router.route('/').post(tourController.getTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(auth(), validate(tourValidation.updateTour), tourController.updateTour)
  .delete(auth(), tourController.deleteTour);

module.exports = router;
