
# Relax Hotel Conference Record System - Deployment Guide

## System Architecture

```
Relax Hotel Conference Record System
├── Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # Admin management components
│   │   │   ├── dashboard/       # Dashboard components  
│   │   │   ├── forms/           # Form components
│   │   │   ├── records/         # Record-related components
│   │   │   └── ui/              # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── pages/               # Page components
│   │   └── services/            # API services
│   └── Hosted on Azure Static Web Apps
└── Backend (Node.js + Express + MySQL)
    ├── controllers/             # Request handlers
    ├── middleware/              # Authentication & validation
    ├── routes/                  # API route definitions
    ├── services/                # Business logic
    ├── utils/                   # Utility functions
    └── Hosted on Azure Web Service
```

## Database Schema

### Core Tables
- **users**: User accounts with departmentId reference
- **departments**: Department definitions
- **records**: Conference records with departmentId reference
- **tags**: Classification tags for records
- **financial_periods**: Financial period definitions
- **record_tags**: Many-to-many relationship between records and tags
- **activity_logs**: System activity tracking

### Key Field Mappings
- Users table: `departmentId` (FK) → `departmentName` (via JOIN)
- Records table: `departmentId` (FK) → `department` (via JOIN)
- Access control: `isPublic`, `isConfidential` → `accessLevel` (computed)

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=https://your-backend-api-url/api
```

### Backend (.env)
```
DB_HOST=your-mysql-host
DB_NAME=relax_hotel_system
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_PORT=3306
PORT=5001
JWT_SECRET=your-jwt-secret
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Records
- `GET /api/records` - List records with filtering
- `GET /api/records/:id` - Get record by ID
- `POST /api/records` - Create new record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Supporting Data
- `GET /api/departments` - List departments
- `GET /api/tags` - List tags
- `GET /api/financial-periods` - List financial periods
- `GET /api/activity-logs` - List activity logs (admin only)

## Deployment Steps

### Database Setup
1. Create MySQL database using schema in `backend/db-schema.sql`
2. Ensure SSL certificate is properly configured
3. Update connection string in environment variables

### Backend Deployment
1. Deploy to Azure Web Service
2. Configure environment variables
3. Ensure SSL certificate path is correct
4. Test database connectivity

### Frontend Deployment
1. Update API URL in environment
2. Build production version
3. Deploy to Azure Static Web Apps
4. Configure custom domain if needed

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify SSL certificate path: `backend/certs/DigiCertGlobalRootCA.crt.pem`
- Check connection string format
- Ensure firewall allows connections

#### Field Name Errors
- Frontend uses `departmentName` for display
- Backend queries use `departmentId` for relationships
- Access control uses `isPublic`/`isConfidential` → `accessLevel`

#### API Errors
- 500 errors: Check backend logs for SQL syntax issues
- 404 errors: Verify route registration in `backend/routes/index.js`
- Authentication errors: Verify JWT token configuration

### Performance Optimization
- Database indexes on frequently queried fields
- Connection pooling for database
- Caching for static lookup data

## Security Considerations
- JWT token expiration and refresh
- Role-based access control
- SQL injection prevention
- HTTPS enforcement
- CORS configuration

## Monitoring
- Activity logs for user actions
- Error logging in backend
- Performance monitoring for database queries
