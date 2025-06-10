
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
│  │  Port: 8080 (dev)       │    │  Port: 5001                   │ │
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
│              │                  │  • require_secure_transport:OFF│ │
│              │                  │  • Firewall Rules Configured   │ │
│              │                  │                                 │ │
│              │                  │  Server: hoteldb.mysql.        │ │
│              │                  │  database.azure.com:3306       │ │
│              │                  │  Database: relax_hotel_system  │ │
│              │                  └─────────────────────────────────┘ │
│              │                                                      │
│              └──────────────── HTTPS API Calls ──────────────────┘
│
└─────────────────────────────────────────────────────────────────────┘
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

2. **Environment Configuration**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp .env.local.example .env.local
   
   # Edit .env for database credentials (production)
   # Edit .env.local for local development API URL
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Test database connection
   node -e "const { testConnection } = require('./config/db'); testConnection();"
   ```

4. **Frontend Setup**
   ```bash
   cd ..  # Return to root directory
   npm install
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev   # or node server.js
   
   # Terminal 2: Start frontend
   cd ..
   npm run dev   # Runs on http://localhost:8080
   ```

### Environment Configuration

#### Production Environment (.env)
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
NODE_ENV=production

# Frontend API URL (Azure production)
VITE_API_URL=https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api
```

#### Local Development (.env.local)
```env
# Local development configuration
VITE_API_URL=http://localhost:5001/api
NODE_ENV=development
```

## Port Configuration

- **Frontend Development Server**: Port 8080 (Vite)
- **Backend API Server**: Port 5001 (Express.js)
- **Database Server**: Port 3306 (MySQL)

These ports do not conflict as they serve different purposes:
- Port 8080: Local frontend development with hot reload
- Port 5001: Backend API server (both local and Azure)
- Port 3306: Database connection

## Azure Deployment Configuration

### 1. Database Setup (Azure MySQL Flexible Server)

**Server Details:**
- Host: `hoteldb.mysql.database.azure.com`
- Port: 3306
- Database: `relax_hotel_system`
- Admin User: `dba`
- Password: `Lezykgu1`

**Security Settings:**
- Public access: Enabled
- Firewall: Allow Azure services + specific IP addresses
- require_secure_transport: OFF (SSL optional)

### 2. Backend Deployment (Azure Web App Service)

**App Service Configuration:**
- Name: `n8n-api`
- URL: `https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net`
- Runtime: Node.js 20 LTS
- Port: 5001

**Environment Variables:**
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
- Build Output: `dist`

**Environment Variables:**
```json
{
  "VITE_API_URL": "https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api"
}
```

## Troubleshooting Common Issues

### 1. Database Connection Issues

**Local Development:**
- Ensure your IP is added to Azure MySQL firewall rules
- Check if "Allow Azure services" is enabled
- Verify credentials in .env file

**Azure Deployment:**
- Check Web App environment variables
- Monitor Azure logs: `az webapp log tail --resource-group n8n --name n8n-api`

### 2. API Connection Issues

**Frontend can't reach API:**
- Check VITE_API_URL in environment variables
- Ensure API URL uses HTTPS for production
- Verify CORS configuration in backend

**Network Errors:**
- Check Azure Web App is running
- Verify API endpoints are accessible
- Monitor browser developer tools for specific errors

### 3. Authentication Issues

**Login failures:**
- Check JWT_SECRET matches between environments
- Verify user exists in database
- Monitor backend logs for authentication errors

### 4. Build and Deployment Issues

**Frontend build fails:**
- Check environment variables are set
- Verify all imports and dependencies
- Test build locally: `npm run build`

**Backend deployment fails:**
- Check package.json scripts
- Verify Node.js version compatibility
- Monitor GitHub Actions logs

## Development Commands

```bash
# Backend development
cd backend
npm run dev          # Start with nodemon
npm start           # Start production server
node server.js      # Direct start

# Frontend development  
npm run dev         # Start Vite dev server (port 8080)
npm run build       # Build for production
npm run preview     # Preview production build

# Database operations
mysql -h hoteldb.mysql.database.azure.com -u dba -p relax_hotel_system
```

## API Testing

### Test Login Endpoint
```bash
# Production API
curl -X POST https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pw1234"}'

# Local API (if backend running locally)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pw1234"}'
```

## Security Considerations

- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- CORS configured for specific origins
- Environment variables protected in Azure
- Database uses parameterized queries to prevent SQL injection

## Monitoring and Logs

- **Azure Application Insights**: Enabled for error tracking
- **Azure Web App Logs**: `az webapp log tail --resource-group n8n --name n8n-api`
- **Database Monitoring**: Available through Azure Portal
- **Frontend Logs**: Browser developer tools and console

This deployment guide provides comprehensive information for setting up, developing, and maintaining the Relax Hotel Conference Record System.
