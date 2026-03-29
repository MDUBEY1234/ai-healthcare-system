// controllers/reportController.js
const HealthReport = require('../models/HealthReport');
const { calculateBMI, calculateBMR } = require('../utils/healthCalculations');
const { generateAIReport } = require('../services/groqService');
const reportDownloadService = require('../services/reportDownloadService');

/**
 * @desc    Generate a new health report
 * @route   POST /api/reports/generate
 * @access  Private
 */
exports.generateReport = async (req, res) => {
    const { height, weight, age, gender } = req.body;
    const userId = req.user.id; // From our authenticateToken middleware

    // 1. Input Validation
    if (!height || !weight || !age || !gender) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields: height, weight, age, and gender.' });
    }

    try {
        // 2. Perform Health Calculations (using our Phase 3 module)
        const { bmi, category: bmiCategory } = calculateBMI(weight, height);
        const bmr = calculateBMR(weight, height, age, gender);

        // 3. Generate AI Report (using our Phase 4 module)
        const aiGeneratedReport = await generateAIReport({ age, gender, height, weight, bmi, bmiCategory, bmr });
        
        if (aiGeneratedReport.includes("Error:") || aiGeneratedReport.includes("We're sorry")) {
             return res.status(500).json({ success: false, message: aiGeneratedReport });
        }

        // 4. Save the full report to the database
        const newReport = await HealthReport.create({
            userId,
            height,
            weight,
            age,
            gender,
            bmi,
            bmr,
            aiGeneratedReport,
        });

        // 5. Send the newly created report back to the user
        res.status(201).json({
            success: true,
            message: 'Health report generated successfully.',
            data: newReport,
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ success: false, message: 'Server error while generating report.' });
    }
};

/**
 * @desc    Get all health reports for a user
 * @route   GET /api/reports/history
 * @access  Private
 */
exports.getReportHistory = async (req, res) => {
    try {
        // Find all reports for the logged-in user and sort by newest first
        const reports = await HealthReport.find({ userId: req.user.id }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });

    } catch (error) {
        console.error('Error getting report history:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving reports.' });
    }
};

/**
 * @desc    Get a single health report by its ID
 * @route   GET /api/reports/:id
 * @access  Private
 */
exports.getReportById = async (req, res) => {
    try {
        const report = await HealthReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }

        // Security Check: Ensure the user requesting the report is the one who owns it
        if (report.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this report.' });
        }

        res.status(200).json({
            success: true,
            data: report,
        });

    } catch (error) {
        console.error('Error getting report by ID:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving report.' });
    }
};

// Add this entire function to controllers/reportController.js

/**
 * @desc    Download a health report as PDF or TXT
 * @route   GET /api/reports/download/:id/:format
 * @access  Private
 */
exports.downloadReport = async (req, res) => {
    try {
        const { id, format } = req.params;
        const userId = req.user.id;

        if (format === 'pdf') {
            const pdfBuffer = await reportDownloadService.generatePDF(id, userId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=health-report-${id}.pdf`);
            res.send(Buffer.from(pdfBuffer));
        } else if (format === 'txt') {
            const textContent = await reportDownloadService.generateText(id, userId);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename=health-report-${id}.txt`);
            res.send(textContent);
        } else {
            return res.status(400).json({ success: false, message: 'Invalid format specified. Use "pdf" or "txt".' });
        }

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Failed to download report.' });
    }
};

/**
 * @desc    Delete a health report
 * @route   DELETE /api/reports/:id
 * @access  Private
 */
exports.deleteReport = async (req, res) => {
    try {
        const report = await HealthReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }
        if (report.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this report.' });
        }
        await report.deleteOne();
        return res.status(200).json({ success: true, message: 'Report deleted successfully.' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting report.' });
    }
};