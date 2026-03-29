// models/ChatConversation.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    relatedReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthReport', default: null },
    messageType: { type: String, enum: ['text', 'report_reference', 'recommendation'], default: 'text' }
});

const ChatConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [MessageSchema],
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    conversationTitle: { type: String, default: 'New Conversation' },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);