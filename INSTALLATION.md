
# Relax Hotel Group - Virtual Conference Records Management

This document provides detailed instructions for setting up and running the Virtual Conference Records Management system for Relax Hotel Group.

## System Requirements

- Node.js v14 or higher
- NPM v6 or higher
- MySQL v5.7 or higher

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd relax-hotel-conference-management
```

### Step 2: Frontend Setup

Install the frontend dependencies:

```bash
npm install
```

Create a `.env` file in the root directory with the following content:

```
VITE_API_URL=http://localhost:5001/api
```

### Step 3: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the backend dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory with the following content:

```
PORT=5001
DB_HOST=localhost
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
JWT_SECRET=your_jwt_secret
```

### Step 4: Database Setup

Create a new MySQL database:

```sql
CREATE DATABASE your_database_name;
```

Create the required tables:

```sql
USE your_database_name;

CREATE TABLE records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  duration VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  participants TEXT NOT NULL,
  videoLink VARCHAR(255),
  textRecord TEXT,
  outline TEXT,
  createdBy VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Step 5: Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. In a separate terminal, start the frontend development server:

```bash
npm run dev
```

3. Access the application at `http://localhost:5173`

## Demo Accounts

The following demo accounts are available for testing:

1. Admin User:
   - Email: admin@example.com
   - Password: admin123

2. Regular User:
   - Email: user@example.com
   - Password: user123

## File Structure Overview

```
├── backend/                  # Backend API server
│   ├── server.js             # Main Express server file with API routes
│   └── package.json          # Backend dependencies
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── records/          # Record-related components
│   │   └── ui/               # Shadcn UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and types
│   ├── pages/                # Page components
│   └── services/             # API services
├── .env                      # Environment variables for frontend
└── package.json              # Frontend dependencies
```

## Project Architecture

- **Frontend**: React with TypeScript, using Vite as the build tool
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query for server state, React Context for global app state
- **Backend**: Express.js API with JWT authentication
- **Database**: MySQL database for storing conference records

## Troubleshooting

### API Connection Issues

If you're seeing 404 errors when connecting to the API:

1. Ensure the backend server is running on port 5001
2. Check that your `.env` file has the correct API URL
3. Verify that CORS is enabled on the backend

### Database Connection Issues

If the backend can't connect to the database:

1. Confirm your MySQL server is running
2. Verify the database credentials in the backend `.env` file
3. Check if the database and required tables exist
4. Ensure your MySQL user has the necessary permissions

### Authentication Problems

If you can't log in:

1. Try the demo accounts listed above
2. Check the JWT secret in the backend `.env` file
3. Clear browser cookies and local storage
