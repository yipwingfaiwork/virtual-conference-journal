
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recordRoutes = require('./routes/records');
const activityLogRoutes = require('./routes/activity-logs');

// Import database connection
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      res.json({ message: 'Database connection successful' });
    } else {
      res.status(500).json({ error: 'Database connection failed' });
    }
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
