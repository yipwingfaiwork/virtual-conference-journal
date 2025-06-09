
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

## Application Structure

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

## Database Schema

### Core Tables Structure

```sql
-- Users with department relationship
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  departmentId INT,                    -- FK to departments.id
  accessLevel ENUM('user', 'admin'),
  isAdmin BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- Departments
departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

-- Records with department relationship
records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATETIME NOT NULL,
  duration INT,
  departmentId INT,                    -- FK to departments.id
  title VARCHAR(255) NOT NULL,
  participants JSON,
  videoLink VARCHAR(500),
  textRecord TEXT,
  outline TEXT,
  isPublic BOOLEAN DEFAULT TRUE,
  isConfidential BOOLEAN DEFAULT FALSE,
  createdBy INT,                       -- FK to users.id
  financialPeriodId INT,               -- FK to financial_periods.id
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (financialPeriodId) REFERENCES financial_periods(id)
);

-- Tags for record classification
tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT
);

-- Many-to-many relationship between records and tags
record_tags (
  recordId INT,
  tagId INT,
  PRIMARY KEY (recordId, tagId),
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- Financial periods
financial_periods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  description TEXT
);

-- Activity logs for audit trail
activity_logs (
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

### Key Field Mappings

| Frontend Display | Database Storage | Implementation |
|-----------------|------------------|----------------|
| `departmentName` | `departmentId` + JOIN | `LEFT JOIN departments d ON u.departmentId = d.id` |
| `department` | `departmentId` + JOIN | `LEFT JOIN departments d ON r.departmentId = d.id` |
| `accessLevel` | `isPublic` + `isConfidential` | Computed: PUBLIC/DEPARTMENT/CONFIDENTIAL |
| `creatorName` | `createdBy` + JOIN | `LEFT JOIN users u ON r.createdBy = u.id` |

## Environment Configuration

### Frontend Environment Variables
```env
# .env (for local development)
VITE_API_URL=http://localhost:5001/api

# Azure Static Web App Environment Variables
VITE_API_URL=https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api
```

### Backend Environment Variables
```env
# Azure Web App Service Environment Variables
NODE_ENV=production
PORT=5001
DB_HOST=hoteldb.mysql.database.azure.com
DB_NAME=relax_hotel_system
DB_USER=dba
DB_PASSWORD=Lezykgu1
DB_PORT=3306
JWT_SECRET=relaxhotelkey
```

## API Endpoints Documentation

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

### Record Management Endpoints
- `GET /api/records` - List records with filtering/pagination
- `GET /api/records/:id` - Get record details by ID
- `POST /api/records` - Create new conference record
- `PUT /api/records/:id` - Update existing record
- `DELETE /api/records/:id` - Delete record
- `GET /api/records/:id/changes` - Get record change history

### Supporting Data Endpoints
- `GET /api/departments` - List all departments
- `GET /api/tags` - List all classification tags
- `GET /api/financial-periods` - List financial periods
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
- Firewall: Allow Azure services
- SSL/TLS: Available but not required (`require_secure_transport: OFF`)

**Database Creation:**
```sql
-- Connect to MySQL and create database
CREATE DATABASE relax_hotel_system;
USE relax_hotel_system;

-- Import schema from backend/db-schema.sql
-- Note: Run the SQL commands manually or use MySQL client
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
**Error:** `Unknown column 'department' in 'field list'`
**Solution:** 
- Use `departmentId` in database queries, not `department`
- JOIN with `departments` table to get `departmentName` for display

**Error:** `SSL connection error`
**Solution:**
- Use simplified SSL configuration: `ssl: { rejectUnauthorized: false }`
- Azure MySQL Flexible Server doesn't require CA certificates when `require_secure_transport: OFF`

#### 2. API 404 Errors
**Error:** `GET /api/tags 404 (Not Found)`
**Solution:**
- Ensure all route files are properly registered in `backend/routes/index.js`
- Verify controller files exist and export required functions

#### 3. CORS Issues
**Error:** Cross-origin request blocked
**Solution:**
- Configure CORS in `backend/middleware/index.js`
- Add both production and development origins
- Handle preflight OPTIONS requests

#### 4. Authentication Errors
**Error:** JWT token validation fails
**Solution:**
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
- Azure App Service logs available via Azure CLI
- Database query logging in development
- Authentication and authorization logs

## Security Considerations

### Authentication & Authorization
- JWT-based authentication with secure secret
- Role-based access control (user/admin)
- Password hashing with bcrypt

### Data Protection
- SQL injection prevention with parameterized queries
- XSS protection with input sanitization
- HTTPS enforcement in production

### Access Control
- Department-based record visibility
- Public/Confidential record classification
- Admin-only operations protection

## Backup and Recovery

### Database Backup
- Azure MySQL automated backups (7-35 days retention)
- Point-in-time recovery available
- Cross-region backup replication option

### Application Recovery
- GitHub repository contains all source code
- Azure deployment from GitHub ensures reproducibility
- Environment variables stored in Azure configuration

This deployment guide provides comprehensive information for setting up, maintaining, and troubleshooting the Relax Hotel Conference Record System on Azure infrastructure.
