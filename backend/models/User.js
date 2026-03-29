// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        lowercase: true
    },
    password: { type: String, required: true, minlength: 6, select: false },
    lastLogin: { type: Date },
    
    // --- NEW FIELDS ---
    profilePicture: { 
        type: String, 
        default: '/default-avatar.png' // A default placeholder
    },
    preferences: {
        chatNotifications: { type: Boolean, default: true },
        reportFormat: { type: String, enum: ['pdf', 'text'], default: 'pdf' },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' }
    },
    chatSettings: {
        chatHistory: { type: Boolean, default: true },
        aiPersonality: { type: String, enum: ['professional', 'friendly', 'motivational'], default: 'professional' }
    }
}, {
    timestamps: true 
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);