// models/HealthReport.js
const mongoose = require('mongoose');

const HealthReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    bmi: { type: Number, required: true },
    bmr: { type: Number, required: true },
    aiGeneratedReport: { type: String, required: true },
    
    // --- NEW FIELDS ---
    reportFormat: {
        structured: { type: Object }, // Store the parsed sections here
        summary: { type: String, default: '' },
        keyRecommendations: { type: [String], default: [] },
        riskFactors: { type: [String], default: [] },
        improvements: { type: [String], default: [] }
    },
    downloadCount: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    isStarred: { type: Boolean, default: false }
}, {
    timestamps: true,
});

module.exports = mongoose.model('HealthReport', HealthReportSchema);