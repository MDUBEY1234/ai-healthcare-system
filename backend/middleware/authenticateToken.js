// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function will be our middleware to protect routes
exports.authenticateToken = async (req, res, next) => {
    let token;

    // The token is expected to be in the "Authorization" header, formatted as "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            // 1. Extract the token from the header
            token = authHeader.split(' ')[1];

            // 2. Verify the token using your JWT_SECRET
            // This checks if the token is valid and hasn't expired
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user from the token's payload (ID)
            // We attach the user object to the request (`req.user`) so that subsequent routes can access it.
            // We exclude the password for security.
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                 // This handles the case where a token is valid but the user has been deleted
                 return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }
            
            // 4. If everything is successful, call next() to pass control to the next function in the chain (the actual route handler)
            next();

        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    // If there's no token in the header at all
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};