// routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Import the controller functions
const { register, login } = require('../controllers/authController');

const { authenticateToken } = require('../middleware/authenticateToken');

// @route   POST /api/auth/register
// @desc    Register a new user and return a token
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
// @access  Public
router.post('/login', login);

// --- PROTECTED TEST ROUTE ---
// @route   GET /api/auth/profile
// @desc    Get the profile of the currently logged-in user
// @access  Private (because we use authenticateToken)
router.get('/profile', authenticateToken, (req, res) => {
    // Because the middleware ran successfully, we have access to req.user
    res.json({
        success: true,
        message: "You have accessed the protected profile route!",
        user: req.user // Sending back the user data attached by the middleware
    });
});

module.exports = router;