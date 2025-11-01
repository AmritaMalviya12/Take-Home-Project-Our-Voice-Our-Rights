const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

router.get('/district/:districtCode', performanceController.getDistrictPerformance);
router.get('/state/:stateName', performanceController.getStateSummary);

module.exports = router;