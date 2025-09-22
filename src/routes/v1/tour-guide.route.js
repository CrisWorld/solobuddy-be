const express = require('express');
const tourGuideController = require('../../controllers/tour-guide.controller');

const router = express.Router();

router.get('/', tourGuideController.getTourGuides);

module.exports = router;
