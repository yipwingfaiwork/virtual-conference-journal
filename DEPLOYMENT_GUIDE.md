
# Relax Hotel Conference Record System - Complete Deployment Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AZURE CLOUD INFRASTRUCTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Azure Static Web App  │    │       Azure Web App Service    │ │
│  │  (Frontend - React)     │    │     (Backend - Node.js/Express)│ │
│  │                         │    │                                 │ │
│  │  • React + TypeScript   │◄──►│  • Express.js API Server      │ │
│  │  • Vite Build System    │    │  • JWT Authentication         │ │
│  │  • Tailwind CSS         │    │  • MySQL2 Database Driver     │ │
│  │  • Shadcn UI Components │    │  • CORS Configuration         │ │
│  │                         │    │                                 │ │
│  │  Domain:                │    │  Domain:                       │ │
│  │  lemon-moss-03941a703.  │    │  n8n-api-d3b9a0f3g4a3e4dc.   │ │
│  │  6.azurestaticapps.net  │    │  uksouth-01.azurewebsites.net │ │
│  └─────────────────────────┘    └─────────────────────────────────┘ │
│              │                                  │                   │
│              │                                  │                   │
│              │                                  ▼                   │
│              │                  ┌─────────────────────────────────┐ │
│              │                  │   Azure Database for MySQL      │ │
│              │                  │     (Flexible Server)           │ │
│              │                  │                                 │ │
│              │                  │  • MySQL 8.0.41-azure         │ │
│              │                  │  • Public Access Enabled       │ │
│              │                  │  • SSL/TLS Support             │ │
│              │                  │  • Firewall Rules Configured   │ │
│              │                  │                                 │ │
│              │                  │  Server: hoteldb.mysql.        │ │
│              │                  │  database.azure.com            │ │
│              │                  │  Database: relax_hotel_system  │ │
│              │                  └─────────────────────────────────┘ │
│              │                                                      │
│              └──────────────── API Calls ─────────────────────────┘
│
└─────────────────────────────────────────────────────────────────────┘
```

## Project File Structure

```
Relax Hotel Conference Record System/
├── Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                    # Admin management interfaces
│   │   │   │   ├── AdminDepartmentsManagement.tsx
│   │   │   │   ├── AdminRecordsManagement.tsx
│   │   │   │   ├── AdminTagsManagement.tsx
│   │   │   │   ├── AdminUsersManagement.tsx
│   │   │   │   └── ActivityLogs.tsx
│   │   │   ├── dashboard/                # Dashboard widgets
│   │   │   │   ├── DashboardChart.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardQuickLinks.tsx
│   │   │   │   └── DashboardRecentRecords.tsx
│   │   │   ├── forms/                    # Form components
│   │   │   │   ├── BasicInformationForm.tsx
│   │   │   │   ├── FormActions.tsx
│   │   │   │   ├── OutlineForm.tsx
│   │   │   │   └── TextRecordForm.tsx
│   │   │   ├── records/                  # Record management
│   │   │   │   ├── EnhancedRecordSearchBar.tsx
│   │   │   │   ├── RecordDetailHeader.tsx
│   │   │   │   ├── RecordsTable.tsx
│   │   │   │   └── RecordTableRow.tsx
│   │   │   ├── ui/                       # Reusable UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   └── ... (shadcn components)
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   ├── hooks/                        # Custom React hooks
│   │   │   ├── use-creator-names.ts
│   │   │   ├── use-records.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/                          # Utility libraries
│   │   │   ├── auth.ts
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── pages/                        # Page components
│   │   │   ├── AdminPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RecordsPage.tsx
│   │   │   └── RecordForm.tsx
│   │   ├── services/                     # API services
│   │   │   ├── api-service.ts
│   │   │   ├── auth-service.ts
│   │   │   └── permission-service.ts
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
└── Backend (Node.js + Express + MySQL)
    ├── config/
    │   └── db.js                         # Database connection
    ├── controllers/                      # Request handlers
    │   ├── activityLogController.js
    │   ├── authController.js
    │   ├── departmentController.js
    │   ├── financialPeriodController.js
    │   ├── recordController.js
    │   ├── tagController.js
    │   ├── userController.js
    │   └── record/
    │       ├── recordReadController.js
    │       ├── recordWriteController.js
    │       └── recordChangeController.js
    ├── middleware/                       # Authentication & validation
    │   ├── auth.js
    │   └── index.js
    ├── routes/                          # API route definitions
    │   ├── activity-logs.js
    │   ├── auth.js
    │   ├── departments.js
    │   ├── financial-periods.js
    │   ├── records.js
    │   ├── tags.js
    │   ├── users.js
    │   └── index.js
    ├── services/                        # Business logic
    │   ├── activityLogService.js
    │   ├── recordService.js
    │   └── tagService.js
    ├── utils/                           # Utility functions
    │   └── logger.js
    ├── db-schema.sql                    # Database schema
    ├── package.json
    └── server.js
```

## Installation and Setup

### Prerequisites

- Node.js 20.x or later
- npm or yarn package manager
- MySQL client (for database setup)
- Azure CLI (for deployment)
- Git

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd relax-hotel-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ..  # Return to root directory
   npm install
   ```

4. **Database Setup**
   ```bash
   # Connect to MySQL server
   mysql -h hoteldb.mysql.database.azure.com -u dba -p
   
   # Create database and import schema
   CREATE DATABASE relax_hotel_system;
   USE relax_hotel_system;
   source backend/db-schema.sql;
   ```

5. **Start Development Servers**
   ```bash
   # Start backend (in backend directory)
   cd backend
   npm run dev
   
   # Start frontend (in root directory)
   cd ..
   npm run dev
   ```

### Environment Configuration

#### Local Development (.env)
```env
# Database Configuration
DB_HOST=hoteldb.mysql.database.azure.com
DB_NAME=relax_hotel_system
DB_USER=dba
DB_PASSWORD=Lezykgu1
DB_PORT=3306

# Server Configuration
PORT=5001
JWT_SECRET=relaxhotelkey
NODE_ENV=development

# API URL
VITE_API_URL=http://localhost:5001/api
```

#### Production Environment Variables

**Azure Web App Service (n8n-api):**
```json
{
  "DB_HOST": "hoteldb.mysql.database.azure.com",
  "DB_NAME": "relax_hotel_system",
  "DB_USER": "dba",
  "DB_PASSWORD": "Lezykgu1",
  "DB_PORT": "3306",
  "JWT_SECRET": "relaxhotelkey",
  "NODE_ENV": "production",
  "PORT": "5001"
}
```

**Azure Static Web App:**
```json
{
  "VITE_API_URL": "https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api"
}
```

## Database Schema

### Core Tables

```sql
-- Users table with department relationship
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  departmentId INT,
  isAdmin BOOLEAN DEFAULT FALSE,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- Departments table
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Records table with enhanced metadata
CREATE TABLE records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATETIME NOT NULL,
  duration INT,
  departmentId INT,
  title VARCHAR(255) NOT NULL,
  participants JSON,
  videoLink VARCHAR(500),
  textRecord TEXT,
  outline TEXT,
  isPublic BOOLEAN DEFAULT TRUE,
  isConfidential BOOLEAN DEFAULT FALSE,
  createdBy INT,
  financialPeriodId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (financialPeriodId) REFERENCES financial_periods(id)
);

-- Tags for record classification
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between records and tags
CREATE TABLE record_tags (
  recordId INT,
  tagId INT,
  PRIMARY KEY (recordId, tagId),
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- Financial periods for record organization
CREATE TABLE financial_periods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for audit trail
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,
  action VARCHAR(255) NOT NULL,
  entityType VARCHAR(100),
  entityId INT,
  details JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login with email/password
- `GET /api/auth/me` - Get current authenticated user info
- `POST /api/auth/logout` - User logout

### User Management Endpoints
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/:id/change-password` - Change user password

### Record Management Endpoints
- `GET /api/records` - List records with filtering/pagination
- `GET /api/records/:id` - Get record details by ID
- `POST /api/records` - Create new conference record
- `PUT /api/records/:id` - Update existing record
- `DELETE /api/records/:id` - Delete record
- `GET /api/records/:id/changes` - Get record change history

### Supporting Data Endpoints
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create new department (admin only)
- `PUT /api/departments/:id` - Update department (admin only)
- `DELETE /api/departments/:id` - Delete department (admin only)
- `GET /api/tags` - List all classification tags
- `POST /api/tags` - Create new tag (admin only)
- `PUT /api/tags/:id` - Update tag (admin only)
- `DELETE /api/tags/:id` - Delete tag (admin only)
- `GET /api/financial-periods` - List financial periods
- `POST /api/financial-periods` - Create new financial period (admin only)
- `GET /api/activity-logs` - System activity logs (admin only)

## Deployment Steps

### 1. Database Setup (Azure MySQL Flexible Server)

**Server Configuration:**
- Server: `hoteldb.mysql.database.azure.com`
- Version: MySQL 8.0.41-azure
- Admin: `dba`
- Password: `Lezykgu1`
- Port: 3306

**Security Settings:**
- Public access: Enabled
- Firewall: Allow Azure services and your local IP
- SSL/TLS: Available but not required (`require_secure_transport: OFF`)

**Database Creation:**
```sql
-- Connect to MySQL and create database
CREATE DATABASE relax_hotel_system;
USE relax_hotel_system;

-- Import schema from backend/db-schema.sql
-- Run the SQL commands manually or use MySQL client
```

### 2. Backend Deployment (Azure Web App Service)

**App Service Configuration:**
- Name: `n8n-api`
- URL: `https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net`
- Runtime: Node.js 20 LTS
- OS: Linux

**Deployment Process:**
1. Code is automatically deployed via GitHub Actions
2. GitHub workflow: `.github/workflows/main_n8n-api.yml`
3. Build process: `npm install` in `/backend` directory
4. Deployment package: `/backend` folder contents

**Required Environment Variables:**
```json
{
  "NODE_ENV": "production",
  "PORT": "5001",
  "DB_HOST": "hoteldb.mysql.database.azure.com",
  "DB_NAME": "relax_hotel_system", 
  "DB_USER": "dba",
  "DB_PASSWORD": "Lezykgu1",
  "DB_PORT": "3306",
  "JWT_SECRET": "relaxhotelkey"
}
```

### 3. Frontend Deployment (Azure Static Web App)

**Static Web App Configuration:**
- Name: `relax-hotel-system`
- URL: `https://lemon-moss-03941a703.6.azurestaticapps.net`
- Framework: React (Vite)

**Deployment Process:**
1. GitHub Actions workflow: `.github/workflows/azure-static-web-apps-lemon-moss-03941a703.yml`
2. Build command: `npm run build`
3. Output directory: `dist`
4. App location: `/` (root)

**Required Environment Variables:**
```json
{
  "VITE_API_URL": "https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api"
}
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Database Connection Errors

**Error:** `ECONNREFUSED` or connection timeout
**Solutions:**
- Verify Azure MySQL firewall allows your IP address
- Check if "Allow Azure services" is enabled
- Ensure database credentials are correct
- Test connection manually: `mysql -h hoteldb.mysql.database.azure.com -u dba -p`

**Error:** `Unknown column 'department' in 'field list'`
**Solution:** 
- Use `departmentId` in database queries, not `department`
- JOIN with `departments` table to get `departmentName` for display

#### 2. API 500 Internal Server Errors

**Error:** Login endpoint returns 500 error
**Solutions:**
- Check server logs for specific error details
- Verify database connection is working
- Ensure `users` table exists with correct schema
- Check if JWT_SECRET environment variable is set

#### 3. API 404 Errors

**Error:** `GET /api/tags 404 (Not Found)`
**Solutions:**
- Ensure all route files are properly registered in `backend/routes/index.js`
- Verify controller files exist and export required functions
- Check if routes are correctly defined in route files

#### 4. CORS Issues

**Error:** Cross-origin request blocked
**Solutions:**
- Configure CORS in `backend/middleware/index.js`
- Add both production and development origins
- Handle preflight OPTIONS requests

#### 5. Authentication Errors

**Error:** JWT token validation fails
**Solutions:**
- Verify `JWT_SECRET` is set in environment variables
- Check token expiration and refresh logic
- Ensure proper Authorization header format: `Bearer <token>`

### Performance Optimization

**Database Indexes:**
```sql
CREATE INDEX idx_records_date ON records(date);
CREATE INDEX idx_records_department ON records(departmentId);
CREATE INDEX idx_records_creator ON records(createdBy);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(departmentId);
CREATE INDEX idx_activity_logs_user ON activity_logs(userId);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
```

**Connection Pooling:**
- MySQL2 connection pool with 10 connections
- 60-second timeout for acquire and query operations
- Automatic reconnection enabled

### Monitoring and Logging

**Application Insights:**
- Connection string configured for error tracking
- Performance monitoring enabled
- Custom telemetry for API endpoints

**Log Analysis:**
- Azure App Service logs available via Azure CLI: `az webapp log tail --resource-group n8n --name n8n-api`
- Database query logging in development
- Authentication and authorization logs

### Development Commands

```bash
# Backend development
cd backend
npm run dev          # Start with nodemon
npm start           # Start production server
npm run test-db     # Test database connection

# Frontend development
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build

# Database operations
mysql -h hoteldb.mysql.database.azure.com -u dba -p relax_hotel_system
```

## Security Considerations

### Authentication & Authorization
- JWT-based authentication with secure secret
- Role-based access control (user/admin)
- Password hashing with bcrypt (10 rounds)
- Session timeout and token expiration

### Data Protection
- SQL injection prevention with parameterized queries
- XSS protection with input sanitization
- HTTPS enforcement in production
- Environment variable protection

### Access Control
- Department-based record visibility
- Public/Confidential record classification
- Admin-only operations protection
- User can only modify their own records

## Backup and Recovery

### Database Backup
- Azure MySQL automated backups (7-35 days retention)
- Point-in-time recovery available
- Cross-region backup replication option

### Application Recovery
- GitHub repository contains all source code
- Azure deployment from GitHub ensures reproducibility
- Environment variables stored in Azure configuration

### Manual Backup Commands
```bash
# Export database
mysqldump -h hoteldb.mysql.database.azure.com -u dba -p relax_hotel_system > backup.sql

# Import database
mysql -h hoteldb.mysql.database.azure.com -u dba -p relax_hotel_system < backup.sql
```

This deployment guide provides comprehensive information for setting up, maintaining, and troubleshooting the Relax Hotel Conference Record System on Azure infrastructure.
