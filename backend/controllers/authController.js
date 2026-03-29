// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to create and sign a JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d', // The token will be valid for 1 day
  });
};

// Controller function for registering a user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with that email already exists' });
    }

    // Create a new user. The password will be hashed automatically by our User model's pre-save hook.
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate a token for the new user
    const token = generateToken(user._id);

    // Send a successful response with the token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// Controller function for logging in a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    // Find the user by email, and explicitly ask for the password which is normally hidden
    const user = await User.findOne({ email }).select('+password');

    // If no user is found, or if the password doesn't match, send back a generic "invalid credentials" error
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Use bcrypt to compare the submitted password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If login is successful, update the lastLogin field
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate a token for the logged-in user
    const token = generateToken(user._id);

    // Send a successful response with the token
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token: token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};