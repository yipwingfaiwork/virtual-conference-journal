
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

## Project File Structure

```
relax-hotel-system/
├── backend/                              # Node.js 後端服務
│   ├── config/
│   │   └── db.js                        # 資料庫連接配置
│   ├── controllers/                     # 控制器層
│   │   ├── authController.js            # 認證控制器
│   │   ├── userController.js            # 用戶管理
│   │   ├── activityLogController.js     # 活動日誌
│   │   ├── departmentController.js      # 部門管理
│   │   ├── tagController.js             # 標籤管理
│   │   ├── financialPeriodController.js # 財務期間
│   │   └── record/                      # 記錄相關
│   │       ├── recordReadController.js  # 讀取記錄
│   │       ├── recordWriteController.js # 寫入記錄
│   │       └── recordChangeController.js# 記錄變更
│   ├── middleware/                      # 中間件
│   │   ├── index.js                     # 主要中間件設置
│   │   └── auth.js                      # 認證中間件
│   ├── routes/                          # 路由定義
│   │   ├── index.js                     # 主路由
│   │   ├── auth.js                      # 認證路由
│   │   ├── users.js                     # 用戶路由
│   │   ├── records.js                   # 記錄路由
│   │   ├── departments.js               # 部門路由
│   │   ├── tags.js                      # 標籤路由
│   │   ├── financial-periods.js         # 財務期間路由
│   │   └── activity-logs.js             # 活動日誌路由
│   ├── services/                        # 服務層
│   │   ├── recordService.js             # 記錄服務
│   │   ├── activityLogService.js        # 活動日誌服務
│   │   └── tagService.js                # 標籤服務
│   ├── utils/
│   │   └── logger.js                    # 日誌工具
│   ├── package.json                     # 依賴配置
│   ├── server.js                        # 服務器入口
│   └── db-schema.sql                    # 資料庫結構
├── src/                                 # React 前端
│   ├── components/                      # 組件
│   │   ├── ui/                         # UI 組件庫
│   │   ├── admin/                      # 管理員組件
│   │   ├── dashboard/                  # 儀表板組件
│   │   ├── records/                    # 記錄組件
│   │   ├── forms/                      # 表單組件
│   │   ├── Navbar.tsx                  # 導航欄
│   │   └── Footer.tsx                  # 頁腳
│   ├── pages/                          # 頁面組件
│   │   ├── LoginPage.tsx               # 登錄頁面
│   │   ├── AdminLoginPage.tsx          # 管理員登錄
│   │   ├── Dashboard.tsx               # 儀表板
│   │   ├── RecordsPage.tsx             # 記錄列表
│   │   ├── RecordDetail.tsx            # 記錄詳情
│   │   ├── RecordForm.tsx              # 記錄表單
│   │   ├── ProfilePage.tsx             # 個人資料
│   │   └── AdminPage.tsx               # 管理頁面
│   ├── services/                       # 服務
│   │   ├── api-service.ts              # API 服務
│   │   ├── auth-service.ts             # 認證服務
│   │   └── permission-service.ts       # 權限服務
│   ├── lib/                           # 工具庫
│   │   ├── types.ts                    # 類型定義
│   │   ├── utils.ts                    # 工具函數
│   │   └── auth.ts                     # 認證工具
│   ├── hooks/                         # 自定義 Hook
│   └── App.tsx                        # 應用主組件
├── .env                               # 生產環境變數
├── .env.local                         # 本地開發環境變數
├── vite.config.ts                     # Vite 配置
├── package.json                       # 前端依賴
└── DEPLOYMENT_GUIDE.md               # 本文件
```

## Database Schema

### Core Tables
- **users**: 用戶資料 (id, name, email, password, departmentId, isAdmin, isActive)
- **departments**: 部門資料 (id, name, description)
- **records**: 會議記錄 (id, title, content, createdById, departmentId, tags, financialPeriod)
- **tags**: 標籤系統 (id, name, color, description)
- **financial_periods**: 財務期間 (id, name, startDate, endDate)
- **activity_logs**: 活動日誌 (id, userId, action, details, recordId, timestamp)

## Installation and Setup

### Prerequisites

- Node.js 20.x or later
- npm 或 yarn package manager
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
   # 複製環境變數文件
   cp .env.example .env
   cp .env.local.example .env.local
   
   # 編輯 .env 設置生產資料庫憑證
   # 編輯 .env.local 設置本地開發 API URL
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # 測試資料庫連接
   node -e "require('./config/db').testConnection();"
   ```

4. **Frontend Setup**
   ```bash
   cd ..  # 回到根目錄
   npm install
   ```

5. **Start Development Servers**
   ```bash
   # 終端 1: 啟動後端
   cd backend
   npm run dev   # 或 node server.js
   
   # 終端 2: 啟動前端
   cd ..
   npm run dev   # 在 http://localhost:8080 運行
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
- Port 8080: 本地前端開發，具有熱重載功能
- Port 5001: 後端 API 服務器（本地和 Azure）
- Port 3306: 資料庫連接

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

**重要依賴要求:**
- 確保 package.json 包含所有必需的依賴項
- 使用 `bcrypt` 而不是 `bcryptjs` 進行密碼加密
- 確保所有 Node 模組在部署時可用

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

### 1. Module Not Found Errors (Azure Deployment)

**症狀:** `Cannot find module 'bcryptjs'` 或類似錯誤

**解決方案:**
- 檢查 backend/package.json 包含所有依賴項
- 確保部署包包含完整的 node_modules
- 使用 `bcrypt` 替代 `bcryptjs`
- 重新部署確保所有依賴項已安裝

### 2. CORS Issues

**症狀:** `Access to XMLHttpRequest has been blocked by CORS policy`

**解決方案:**
- 檢查 backend/middleware/index.js 中的 CORS 設置
- 確保 Azure Static Web App URL 在允許來源列表中
- 驗證預檢請求處理是否正確

### 3. Database Connection Issues

**Local Development:**
- 確保你的 IP 已添加到 Azure MySQL 防火牆規則
- 檢查是否啟用了"允許 Azure 服務"
- 驗證 .env 文件中的憑證

**Azure Deployment:**
- 檢查 Web App 環境變數
- 監控 Azure 日誌: `az webapp log tail --resource-group n8n --name n8n-api`

### 4. API Connection Issues

**Frontend can't reach API:**
- 檢查環境變數中的 VITE_API_URL
- 確保生產環境使用 HTTPS 的 API URL
- 驗證後端的 CORS 配置

**Network Errors:**
- 檢查 Azure Web App 是否正在運行
- 驗證 API 端點是否可訪問
- 監控瀏覽器開發工具中的特定錯誤

### 5. Authentication Issues

**Login failures:**
- 檢查環境間的 JWT_SECRET 是否匹配
- 驗證用戶是否存在於資料庫中
- 監控後端日誌中的認證錯誤

### 6. Build and Deployment Issues

**Frontend build fails:**
- 檢查環境變數是否設置
- 驗證所有導入和依賴項
- 本地測試構建: `npm run build`

**Backend deployment fails:**
- 檢查 package.json scripts
- 驗證 Node.js 版本兼容性
- 監控 GitHub Actions 日誌

## Development Commands

```bash
# Backend development
cd backend
npm run dev          # 使用 nodemon 啟動
npm start           # 啟動生產服務器
node server.js      # 直接啟動

# Frontend development  
npm run dev         # 啟動 Vite 開發服務器 (port 8080)
npm run build       # 構建生產版本
npm run preview     # 預覽生產構建

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

# Local API (如果後端在本地運行)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pw1234"}'
```

## Security Considerations

- JWT tokens 在 24 小時後過期
- 密碼使用 bcrypt 進行哈希
- CORS 配置為特定來源
- 環境變數在 Azure 中受保護
- 資料庫使用參數化查詢防止 SQL 注入

## Performance Optimization

### Backend Optimization
- 使用連接池進行資料庫操作
- 實施適當的索引策略
- 啟用 gzip 壓縮
- 設置適當的快取標頭

### Frontend Optimization
- 實施代碼分割
- 使用 React.memo 進行組件優化
- 懶加載非關鍵組件
- 優化圖像和資源

## Monitoring and Logs

- **Azure Application Insights**: 啟用錯誤跟踪
- **Azure Web App Logs**: `az webapp log tail --resource-group n8n --name n8n-api`
- **Database Monitoring**: 通過 Azure Portal 可用
- **Frontend Logs**: 瀏覽器開發工具和控制台

## Backup and Recovery

### Database Backup
- Azure MySQL 自動備份已啟用
- 點時間恢復可用
- 建議定期導出重要資料

### Application Backup
- 源代碼版本控制在 Git 中
- 部署配置存儲在 Azure DevOps
- 環境變數記錄在安全文件中

This deployment guide provides comprehensive information for setting up, developing, and maintaining the Relax Hotel Conference Record System.
