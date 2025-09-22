const express = require('express');
const seedController = require('../../controllers/seed.controller');

const router = express.Router();

router.post('/tour-guides', seedController.seedTourGuides);

module.exports = router;
