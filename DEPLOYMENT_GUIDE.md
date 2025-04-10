
# Deployment Guide for MAMP Server

This guide will help you deploy this React application with a Node.js backend on a MAMP server.

## Project Structure

For proper separation of concerns, your project should be organized into two main folders:

```
project-root/
├── frontend/ (React application)
└── backend/ (Node.js API server)
```

## Step 1: Setting Up the Project Structure

1. Create two directories in your project root:

```bash
mkdir -p backend
# The frontend is your current React application
```

2. Move your current React application files to the frontend folder (except for the backend-specific files).

## Step 2: Setting Up the Backend

Create the following files in your backend folder:

### Package.json for Backend

Create a `package.json` file in the backend folder:

```bash
cd backend
npm init -y
npm install express mysql2 cors dotenv
```

### Server Configuration

Create an `.env` file in the backend folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=your_database_name
DB_PORT=8889
PORT=5000
```

### Main Server File

Create a `server.js` file in the backend folder that connects to MySQL and serves API endpoints:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'my_database',
  port: Number(process.env.DB_PORT) || 8889,
  connectionLimit: 10,
};

// Create a pool for managing connections
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    res.json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Example API endpoint for records
app.get('/api/records', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM records');
    res.json(results);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Add more API endpoints here based on your application needs

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 3: Configure the Frontend

Update the API base URL in your frontend to point to your backend server:

1. Create a `.env.local` file in the frontend folder:

```
VITE_API_URL=http://localhost:5000/api
```

2. Update the API service to use this environment variable:

```javascript
// in src/services/api-service.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Step 4: Database Setup

1. Open phpMyAdmin in MAMP (usually at http://localhost:8888/phpMyAdmin/)
2. Create a new database for your application
3. Run the following SQL to create the necessary tables:

```sql
CREATE DATABASE my_database;
USE my_database;

CREATE TABLE records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(255) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  participants JSON,
  videoLink TEXT,
  textRecord TEXT,
  outline TEXT,
  createdBy VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(100),
  address TEXT,
  department VARCHAR(100),
  accessLevel INT DEFAULT 1,
  isAdmin BOOLEAN DEFAULT false,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO users (name, email, phone, address, department, accessLevel, isAdmin, password) 
VALUES ('Admin User', 'admin@example.com', '123-456-7890', '123 Main St', 'Administration', 3, true, 'password123');
```

## Step 5: Building and Deploying

### Backend Deployment

1. Start your Node.js backend server:

```bash
cd backend
node server.js
```

2. The backend API will be available at `http://localhost:5000/api`

### Frontend Deployment

1. Build your React application:

```bash
cd frontend
npm run build
```

2. Copy the contents of the `dist` folder to your MAMP `htdocs` directory:

```bash
cp -R dist/* /Applications/MAMP/htdocs/your-project-folder/
```

## Step 6: Configure MAMP

1. Start MAMP
2. Make sure Apache is running on port 8888 (or your preferred port)
3. Make sure MySQL is running on port 8889 (default MAMP MySQL port)
4. Access your application at `http://localhost:8888/your-project-folder/`

## Troubleshooting

1. **CORS errors**: Make sure your backend has CORS enabled and is properly configured to allow requests from your frontend origin.

2. **Database connection errors**: Verify your MySQL credentials in the `.env` file and ensure MAMP's MySQL server is running.

3. **API endpoint not found**: Check that your API routes match the ones expected by the frontend.

4. **Static file loading issues**: Make sure all paths in your production build are relative, not absolute.

## Production Considerations

For a production environment, you would want to:

1. Use environment variables for sensitive information
2. Implement proper authentication with JWT or session cookies
3. Set up HTTPS
4. Use a reverse proxy like Nginx
5. Implement proper error handling and logging

This guide provides a basic setup for testing and development purposes on MAMP.
