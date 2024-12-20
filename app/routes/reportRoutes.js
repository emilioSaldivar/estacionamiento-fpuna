const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportController');

// GET /reports?startDate=2024-01-01&endDate=2024-01-31 (parámetros opcionales)
router.get('/', reportsController.getReports);

module.exports = router;
