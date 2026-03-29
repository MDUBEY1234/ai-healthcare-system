// services/reportDownloadService.js
const { jsPDF } = require('jspdf');
const { htmlToText } = require('html-to-text');
const HealthReport = require('../models/HealthReport');

class ReportDownloadService {
    // Fetches and validates a report
    async getReport(reportId, userId) {
        const report = await HealthReport.findById(reportId);
        if (!report) throw new Error('Report not found.');
        if (report.userId.toString() !== userId) throw new Error('Not authorized to access this report.');
        
        // Update access stats
        report.lastAccessed = new Date();
        report.downloadCount += 1;
        await report.save();

        return report;
    }

    // Generates a PDF buffer
    async generatePDF(reportId, userId) {
        const report = await this.getReport(reportId, userId);
        const doc = new jsPDF();
        
        // Simple text-based PDF generation
        const reportText = this.formatAsText(report);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        
        // The splitTextToSize function handles word wrapping
        const lines = doc.splitTextToSize(reportText, 180); // 180 is the width of the text block
        doc.text(lines, 15, 20); // x, y coordinates
        
        // Return the PDF as a buffer
        return doc.output('arraybuffer');
    }

    // Generates a plain text string
    async generateText(reportId, userId) {
        const report = await this.getReport(reportId, userId);
        return this.formatAsText(report);
    }

    // Helper function to format the report into a clean string
    formatAsText(report) {
        // A more robust solution might parse the markdown properly.
        // For now, we'll clean it up.
        const cleanedReport = report.aiGeneratedReport
            .replace(/#|##|###/g, '') // Remove markdown headers
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/=/g, ''); // Remove divider characters

        const reportHeader = `
AI Health Consultation Report
=============================
Generated For: User ${report.userId}
Date: ${new Date(report.createdAt).toUTCString()}

Patient Metrics:
- Age: ${report.age}
- Gender: ${report.gender}
- Height: ${report.height} cm
- Weight: ${report.weight} kg
- BMI: ${report.bmi}
-----------------------------
        `;
        return reportHeader + '\n' + cleanedReport;
    }
}

module.exports = new ReportDownloadService();