
# Deployment Guide for Relax Hotel Group Application

This guide will help you deploy this React application with a Node.js backend on a MAMP server.

## Project Structure

The project is organized into two main folders:

```
relax-hotel-system/
├── frontend/ (React application)
└── backend/ (Node.js API server)
```

## Prerequisites

- macOS with MAMP installed
- MySQL (included with MAMP)
- Visual Studio Code
- Node.js and npm

## Step 1: Database Setup

1. Start MAMP and ensure MySQL is running on port 8889
2. Open phpMyAdmin (usually at http://localhost:8888/phpMyAdmin/)
3. Import the SQL schema from `backend/db-schema.sql`
4. This will create the `relax_hotel_system` database with the required tables and sample users:
   - Admin user: admin@example.com / admin123
   - Regular user: user@example.com / user123

## Step 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content (adjust as needed):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=relax_hotel_system
   DB_PORT=8889
   PORT=5001
   JWT_SECRET=relax-hotel-secret-key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. The API server will be available at `http://localhost:5001/api`

## Step 3: Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The frontend will be available at `http://localhost:5173` or another port provided by Vite

## Step 4: Production Deployment

### Backend Deployment

1. Build the backend for production:
   ```bash
   cd backend
   npm run build
   ```

2. Use PM2 or a similar process manager to keep the Node.js server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "relax-hotel-api"
   ```

### Frontend Deployment

1. Build the React application:
   ```bash
   cd frontend
   npm run build
   ```

2. Copy the contents of the `dist` folder to your MAMP `htdocs` directory:
   ```bash
   cp -R dist/* /Applications/MAMP/htdocs/relax-hotel/
   ```

## Database Schema

The application uses the following main tables:

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  address TEXT,
  department VARCHAR(100),
  accessLevel INT DEFAULT 1,
  isAdmin BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Records Table
```sql
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
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Troubleshooting

1. **MySQL Connection Issues**
   - Verify MAMP MySQL is running on port 8889
   - Check database credentials in `.env` file
   - Test connection with `/api/test-connection` endpoint

2. **Authentication Errors**
   - Ensure the users table is properly created with sample users
   - Verify JWT_SECRET is the same in the `.env` file

3. **Frontend API Connection Issues**
   - Check that VITE_API_URL points to the correct backend URL
   - Verify the backend server is running
   - Check for CORS issues in the server configuration

4. **Port Conflicts**
   - If port 5001 is already in use, change it in the backend `.env` file
   - Update the frontend VITE_API_URL to match the new port

## Security Considerations for Production

1. Use a proper password hashing mechanism (bcrypt is implemented)
2. Store JWT secrets securely
3. Implement HTTPS for all traffic
4. Add rate limiting to prevent brute force attacks
5. Regularly update dependencies to patch security vulnerabilities
