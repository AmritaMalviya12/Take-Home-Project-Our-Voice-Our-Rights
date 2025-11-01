const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

router.get('/', districtController.getAllDistricts);
router.get('/state/:stateName', districtController.getDistrictsByState);
router.get('/:districtCode', districtController.getDistrictByCode);

module.exports = router;