// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { generateReport, getReportHistory, getReportById, downloadReport, deleteReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authenticateToken');

// All routes in this file are protected and require a valid token
router.use(authenticateToken);
router.route('/download/:id/:format').get(downloadReport);
router.route('/generate').post(generateReport);
router.route('/history').get(getReportHistory);
router.route('/:id').get(getReportById).delete(deleteReport);

module.exports = router;