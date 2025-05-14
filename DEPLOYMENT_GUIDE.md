
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
   - Import the SQL schema from `backend/db-schema.sql`
   - This will create the required tables and sample data:
     - Two sample users:
       - Admin user: admin@example.com / admin123
       - Regular user: user@example.com / user123
     - Sample meeting records
     - Sample activity logs

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

### Azure Deployment
1. Create an Azure Web App for the backend:
   - Log in to the Azure Portal
   - Create a new Web App with Node.js runtime
   - Set up deployment from GitHub using the GitHub Actions workflow

2. Configure environment variables in the Azure Web App:
   - Go to your Web App > Configuration > Application settings
   - Add all the environment variables from your .env file

3. GitHub Actions deployment is configured in `.github/workflows/main_n8n-api.yml`
   - Make sure the correct Azure credentials are configured in GitHub repository secrets:
     - `AZUREAPPSERVICE_CLIENTID_EC26A69020B34E23941C2C5CEA7C131D`
     - `AZUREAPPSERVICE_TENANTID_688ED3F6659A452F8CCA8F4F7A22260D`
     - `AZUREAPPSERVICE_SUBSCRIPTIONID_E31BC13E1922418DAA472D43596C6654`

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

### Records Table (Meeting Records)
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
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);
```

### Activity Logs Table
```sql
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  recordId INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE SET NULL
);
```

## Feature Overview

The application provides the following features:

### All Users
- Login and authentication
- View dashboard with recent records and statistics
- View, create and update meeting records
- Search and filter meeting records
- Profile management and password updates

### Administrators
- All standard user features
- Delete meeting records
- View activity logs of all users
- User management (coming soon)
- System settings (coming soon)

## Troubleshooting Azure Deployments

1. **Backend Deployment Issues:**
   - Check Application Logs in the Azure Portal
   - Review GitHub Actions workflow runs for any failures
   - Verify all environment variables are properly configured
   - Check Application Insights for runtime errors
   - Ensure Azure service principal credentials in GitHub secrets are correct
   - Verify the tenant ID is correct and exists in your Azure subscription

2. **Frontend Deployment Issues:**
   - Check the GitHub Actions workflow run status
   - Verify that the `output_location` in the workflow file is set to `dist` (Vite's default)
   - Check browser console for CORS or API connection issues
   - Review build logs in GitHub Actions for any compilation errors

3. **Database Connection Issues:**
   - Verify firewall rules allow connections from Azure services
   - Check connection string parameters in application settings
   - Test connection with a database client

4. **CORS Issues:**
   - Ensure the backend server has CORS configured to allow requests from the frontend domain
   - Update CORS configuration in the backend middleware

5. **Authentication Issues:**
   - Ensure JWT_SECRET is properly configured
   - Verify tokens are being properly sent and verified

## Security Considerations for Production

1. Use Azure Key Vault to store sensitive credentials and secrets
2. Implement Azure Active Directory authentication for added security
3. Use HTTPS for all traffic (provided by default with Azure Web Apps)
4. Set up Azure Web Application Firewall policies
5. Configure regular database backups
