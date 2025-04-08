
# MySQL Database Connection Guide

## Overview
This document explains the architecture for connecting the React frontend application to a MySQL database.

## Architecture
The application follows a three-tier architecture:
1. Frontend (React)
2. Backend API (Node.js/Express)
3. Database (MySQL)

## Security Notice
**IMPORTANT**: Never connect directly to a MySQL database from a frontend application. This would expose your database credentials and is a severe security risk.

## Implementation Details

### Frontend Implementation
- The frontend uses API services to communicate with the backend
- Authentication tokens are included in API requests
- React Query is used for data fetching and state management

### Backend Implementation (to be set up separately)
- A Node.js server with Express handles API requests
- Database queries are executed using mysql2/promise
- Connection pooling is implemented for better performance
- Environment variables store database credentials

### Database Schema Example
```sql
CREATE DATABASE my_database;
USE my_database;

CREATE TABLE records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  department VARCHAR(100),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  access_level ENUM('user', 'manager', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Next Steps
1. Set up a Node.js/Express backend server
2. Install mysql2 package on the server: `npm install mysql2`
3. Create database connection as shown in the backend example
4. Implement API endpoints for CRUD operations
5. Secure the API with authentication

## Recommended Packages for Backend
- Express.js - Web server framework
- mysql2 - MySQL client for Node.js with Promise support
- dotenv - For loading environment variables
- jsonwebtoken - For implementing JWT authentication
- bcrypt - For password hashing
