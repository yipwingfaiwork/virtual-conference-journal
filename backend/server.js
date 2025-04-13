
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import middleware and routes setup
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Apply middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
