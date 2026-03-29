const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from backend/.env explicitly
// This line MUST be before connectDB is called or required.
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow server to accept JSON data in request body

// --- API Routes ---

// Simple test route to check if the server is up
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Define Health Report Routes
app.use('/api/reports', require('./routes/reportRoutes'));

// Define Chat Routes
app.use('/api/chat', require('./routes/chatRoutes'));

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});