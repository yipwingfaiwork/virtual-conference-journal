
# Deployment Guide for Relax Hotel Group Management System

This guide will help you deploy the Relax Hotel Group Management System, a React application with a Node.js backend on Microsoft Azure.

## Project Structure

The project is organized into two main folders:

```
relax-hotel-system/
├── frontend/ (React application built with Vite)
└── backend/ (Node.js API server)
```

## Prerequisites

- Microsoft Azure account with active subscription
- Azure CLI installed
- Node.js and npm installed
- Git installed

## Step 1: Database Setup

1. Create an Azure MySQL Database:
   - Log in to the Azure Portal (https://portal.azure.com)
   - Create a new Azure Database for MySQL flexible server
   - Create a new database named `relax_hotel_system`
   - Configure firewall rules to allow your development machine and Azure services

2. Import the SQL schema:
   - Use the Azure Cloud Shell or MySQL Workbench to connect to your database
   - **IMPORTANT**: Execute the SQL schema from `backend/db-schema.sql` line by line or in sections to avoid foreign key constraint errors
   - This will create the required normalized tables:
     - `departments` - Department information
     - `access_levels` - User permission levels
     - `tags` - Meeting classification tags
     - `financial_periods` - Financial reporting periods
     - `users` - Enhanced user table with department and access level relationships
     - `records` - Enhanced meeting records with access control
     - `record_tags` - Many-to-many relationship between records and tags
     - `record_changes` - Change history tracking
     - `activity_logs` - System activity logging
   - Sample data includes:
     - Four sample users with different access levels
     - Sample meeting records with tags
     - Default departments, access levels, tags, and financial periods

3. Database Features:
   - **Normalized Design**: All tables follow 1NF, 2NF, and 3NF principles
   - **Access Control**: Records have access levels (PUBLIC, DEPARTMENT, RESTRICTED, CONFIDENTIAL)
   - **Change Tracking**: All record modifications are logged with timestamps
   - **Tag System**: Flexible tagging system for meeting classification
   - **Department Isolation**: Users can only access records from their department unless explicitly granted access

## Step 2: Backend Setup

### Local Development
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   DB_HOST=your-azure-mysql-server.mysql.database.azure.com
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=relax_hotel_system
   DB_PORT=3306
   PORT=5001
   JWT_SECRET=relax-hotel-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### New API Endpoints Added
- `/api/tags` - Tag management for meeting classification
- `/api/financial-periods` - Financial period management
- `/api/users` - Enhanced user management with department and access level support
- `/api/records/:id/changes` - Record change history

### Azure Deployment
1. Create an Azure Web App for the backend:
   - Log in to the Azure Portal
   - Create a new Web App with Node.js runtime
   - Set up deployment from GitHub using the GitHub Actions workflow

2. Configure environment variables in the Azure Web App:
   - Go to your Web App > Configuration > Application settings
   - Add all the environment variables from your .env file

3. GitHub Actions deployment is configured in `.github/workflows/main_n8n-api.yml`
   - Make sure the correct Azure credentials are configured in GitHub repository secrets

## Step 3: Frontend Setup

### Local Development
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
   # For production: VITE_API_URL=https://your-backend-webapp.azurewebsites.net/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### New Frontend Features Added
- **Enhanced Search**: Multi-criteria filtering by date, title, keywords, creator, tags, and financial periods
- **Calendar View**: Interactive calendar display of meeting records
- **Change History**: View complete change history for each record
- **Tag System**: Visual tag management and filtering
- **Access Control**: Permission-based record visibility
- **Department Filtering**: Department-based record access control

### Azure Deployment
1. For frontend deployment, we're using Azure Static Web Apps:
   - Configured in `.github/workflows/azure-static-web-apps-lemon-moss-03941a703.yml`
   - This automatically builds and deploys your React app to Azure Static Web Apps
   - **Important**: This project uses Vite which outputs to the `dist` directory, not `build`

2. Configure environment variables:
   - Go to your Static Web App > Configuration
   - Add the production API URL environment variable:
     ```
     VITE_API_URL=https://your-backend-webapp.azurewebsites.net/api
     ```

## Build and Output Configuration

For Vite-based applications:
- The default build output directory is `dist`
- The Azure Static Web App workflow should have `output_location` set to `dist`
- The build command is `npm run build` which runs Vite's build process

## Enhanced Database Schema

The application now uses a fully normalized database structure:

### Key Tables and Relationships

#### Users Table (Enhanced)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  address TEXT,
  departmentId INT,
  accessLevelId INT DEFAULT 1,
  isAdmin BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (accessLevelId) REFERENCES access_levels(id)
);
```

#### Records Table (Enhanced)
```sql
CREATE TABLE records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  duration VARCHAR(100) NOT NULL,
  departmentId INT,
  title VARCHAR(255) NOT NULL,
  participants JSON,
  importFromAI BOOLEAN DEFAULT false,
  videoLink TEXT,
  textRecord TEXT,
  outline TEXT,
  remark TEXT,
  createdBy INT,
  financialPeriodId INT,
  accessLevel ENUM('PUBLIC', 'DEPARTMENT', 'RESTRICTED', 'CONFIDENTIAL') DEFAULT 'DEPARTMENT',
  allowedDepartments JSON,
  allowedUsers JSON,
  isConfidential BOOLEAN DEFAULT false,
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (financialPeriodId) REFERENCES financial_periods(id)
);
```

#### New Supporting Tables
- **departments**: Normalized department information
- **access_levels**: User permission levels with JSON permissions
- **tags**: Meeting classification tags with colors
- **financial_periods**: Financial reporting periods
- **record_tags**: Many-to-many relationship between records and tags
- **record_changes**: Complete change history tracking
- **activity_logs**: Enhanced system activity logging

## Feature Overview

The application now provides these enhanced features:

### All Users
- Login and authentication with department and access level validation
- Enhanced dashboard with department-specific statistics
- Advanced search and filtering capabilities
- Calendar view of meeting records
- Tag-based record organization
- Access to records based on department and permission level

### Enhanced Search and Filtering
- **Text Search**: Search by title, content, and keywords
- **Date Range**: Filter by specific date ranges
- **Department**: Filter by department (respecting access permissions)
- **Tags**: Multi-tag filtering with visual tag selection
- **Creator**: Filter by record creator
- **Financial Period**: Filter by financial reporting periods
- **Access Level**: Filter by record access level

### Access Control System
- **Department-based Access**: Users can only see records from their department by default
- **Access Level Control**: Four levels (Basic, Supervisor, Manager, Admin) with different permissions
- **Record-level Security**: Individual records can have PUBLIC, DEPARTMENT, RESTRICTED, or CONFIDENTIAL access
- **Cross-department Access**: Records can be explicitly shared with other departments
- **User-specific Access**: Records can be shared with specific users

### Administrators
- All standard user features
- Full system access regardless of department restrictions
- User management capabilities
- System activity monitoring
- Access to all records and change history

## Troubleshooting Azure Deployments

1. **Database Setup Issues:**
   - Execute the SQL schema in sections to avoid constraint errors
   - Ensure all tables are created before running the sample data inserts
   - Verify foreign key relationships are properly established
   - Check that indexes are created for optimal performance

2. **Backend Deployment Issues:**
   - Verify all new route files are properly deployed
   - Check that database connection supports the new table structure
   - Ensure environment variables include all required database credentials
   - Test API endpoints individually: `/api/tags`, `/api/financial-periods`, `/api/users`

3. **Frontend Deployment Issues:**
   - Verify that the enhanced search component dependencies are installed
   - Check that all new TypeScript interfaces are properly defined
   - Test calendar view functionality
   - Verify tag filtering and visual components work correctly

4. **Permission and Access Issues:**
   - Verify user department and access level assignments in the database
   - Test record visibility based on access levels
   - Check that department filtering works correctly
   - Verify that change history tracking is functioning

## Security Considerations for Production

1. **Enhanced Database Security:**
   - Use Azure Key Vault for database credentials
   - Implement row-level security policies
   - Set up regular automated backups
   - Monitor access patterns for unusual activity

2. **Access Control Security:**
   - Regularly audit user access levels and department assignments
   - Implement session timeout for sensitive access levels
   - Log all access attempts to confidential records
   - Set up alerts for unauthorized access attempts

3. **Data Protection:**
   - Encrypt sensitive record content at rest
   - Implement data retention policies for change history
   - Set up automated cleanup for old activity logs
   - Ensure GDPR compliance for user data handling
