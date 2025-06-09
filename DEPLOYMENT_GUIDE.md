
# Relax Hotel Group Virtual Conference Records Management System
## Deployment Guide

### 系統概述
本系統是一個全端會議記錄管理系統，包含前端 React 應用程式和後端 Node.js API，支援使用者和管理員的不同權限級別。

### 網站架構圖
```
relax-hotel-system/
├── frontend/ (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn/ui 元件)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── ... (其他 UI 元件)
│   │   │   ├── admin/ (管理員元件)
│   │   │   │   ├── ActivityLogs.tsx
│   │   │   │   ├── AdminDepartmentsManagement.tsx
│   │   │   │   ├── AdminRecordsManagement.tsx
│   │   │   │   ├── AdminTagsManagement.tsx
│   │   │   │   └── AdminUsersManagement.tsx
│   │   │   ├── dashboard/ (儀表板元件)
│   │   │   │   ├── DashboardChart.tsx
│   │   │   │   ├── DashboardDepartmentStats.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardQuickLinks.tsx
│   │   │   │   ├── DashboardQuickSearch.tsx
│   │   │   │   └── DashboardRecentRecords.tsx
│   │   │   ├── forms/ (表單元件)
│   │   │   │   ├── BasicInformationForm.tsx
│   │   │   │   ├── FormActions.tsx
│   │   │   │   ├── OutlineForm.tsx
│   │   │   │   └── TextRecordForm.tsx
│   │   │   ├── records/ (記錄相關元件)
│   │   │   │   ├── CalendarView.tsx
│   │   │   │   ├── EnhancedRecordSearchBar.tsx
│   │   │   │   ├── RecordChangeHistory.tsx
│   │   │   │   ├── RecordConferenceDetails.tsx
│   │   │   │   ├── RecordContentSections.tsx
│   │   │   │   ├── RecordDetailHeader.tsx
│   │   │   │   ├── RecordHeader.tsx
│   │   │   │   ├── RecordParticipants.tsx
│   │   │   │   ├── RecordResources.tsx
│   │   │   │   ├── RecordSearchBar.tsx
│   │   │   │   ├── RecordTableRow.tsx
│   │   │   │   └── RecordsTable.tsx
│   │   │   ├── AccessLevelBadge.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx (首頁)
│   │   │   ├── LoginPage.tsx (使用者登入)
│   │   │   ├── AdminLoginPage.tsx (管理員登入)
│   │   │   ├── Dashboard.tsx (儀表板)
│   │   │   ├── RecordsPage.tsx (記錄列表)
│   │   │   ├── RecordDetail.tsx (記錄詳情)
│   │   │   ├── RecordForm.tsx (新增/編輯記錄)
│   │   │   ├── ProfilePage.tsx (個人資料)
│   │   │   ├── AdminPage.tsx (管理員面板)
│   │   │   ├── NotFoundPage.tsx (404頁面)
│   │   │   └── NotFound.tsx
│   │   ├── services/
│   │   │   ├── api-service.ts (API 呼叫)
│   │   │   ├── auth-service.ts (驗證服務)
│   │   │   └── permission-service.ts (權限服務)
│   │   ├── lib/
│   │   │   ├── auth.ts (驗證相關)
│   │   │   ├── types.ts (TypeScript 類型)
│   │   │   ├── utils.ts (通用工具)
│   │   │   └── db-config.ts (資料庫配置)
│   │   ├── hooks/ (自定義 React Hooks)
│   │   │   ├── use-creator-names.ts
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-records.ts
│   │   │   └── use-toast.ts
│   │   └── App.tsx (主應用程式)
│   └── public/
└── backend/ (Node.js + Express + MySQL)
    ├── controllers/
    │   ├── record/
    │   │   ├── recordReadController.js (記錄讀取)
    │   │   ├── recordWriteController.js (記錄寫入)
    │   │   └── recordChangeController.js (記錄變更)
    │   ├── authController.js (驗證控制器)
    │   ├── userController.js (使用者控制器)
    │   ├── activityLogController.js (活動日誌)
    │   └── recordController.js (記錄控制器聚合)
    ├── services/
    │   ├── recordService.js (記錄業務邏輯)
    │   ├── tagService.js (標籤業務邏輯)
    │   └── activityLogService.js (活動日誌服務)
    ├── routes/
    │   ├── auth.js (驗證路由)
    │   ├── users.js (使用者路由)
    │   ├── records.js (記錄路由)
    │   ├── tags.js (標籤路由)
    │   ├── departments.js (部門路由)
    │   ├── financial-periods.js (財務期間路由)
    │   ├── activity-logs.js (活動日誌路由)
    │   └── index.js (路由聚合)
    ├── middleware/
    │   ├── auth.js (驗證中介軟體)
    │   └── index.js (中介軟體聚合)
    ├── config/
    │   ├── db.js (資料庫配置)
    │   └── certs/ (SSL 憑證)
    ├── utils/
    │   └── logger.js (日誌工具)
    ├── db-schema.sql (資料庫架構)
    └── server.js (主伺服器檔案)
```

### 資料庫架構和欄位對應
**重要：前端和後端的欄位對應關係**

| 前端 TypeScript 類型 | 資料庫欄位 | 說明 |
|---------------------|-----------|------|
| `User.departmentId` | `users.departmentId` | 部門ID（外鍵） |
| `User.departmentName` | `departments.name` | 部門名稱（透過JOIN取得） |
| `ConferenceRecord.departmentId` | `records.departmentId` | 記錄所屬部門ID |
| `ConferenceRecord.department` | `departments.name` | 部門名稱（透過JOIN取得） |
| `ConferenceRecord.accessLevel` | 計算欄位 | 基於 `isPublic` 和 `isConfidential` 計算 |

### 主要功能
- **使用者管理**: 註冊、登入、權限控制
- **記錄管理**: 新增、編輯、刪除、搜尋會議記錄
- **標籤系統**: 記錄分類和篩選
- **部門管理**: 部門組織架構
- **活動日誌**: 系統操作追蹤
- **管理員面板**: 全系統管理功能

### 技術堆疊
**前端**:
- React 18 + TypeScript
- Vite (建置工具)
- Tailwind CSS (樣式)
- shadcn/ui (UI 元件庫)
- React Router (路由)
- Tanstack Query (狀態管理)
- Axios (HTTP 客戶端)

**後端**:
- Node.js + Express
- MySQL (資料庫)
- JWT (身份驗證)
- bcrypt (密碼加密)

### 資料庫架構
- **users**: 使用者資料 (id, name, email, phone, address, departmentId, isAdmin, isActive)
- **departments**: 部門資料 (id, name, description)
- **records**: 會議記錄 (id, date, duration, departmentId, title, participants, videoLink, textRecord, outline, remark, createdBy, financialPeriodId, isPublic, isConfidential)
- **tags**: 標籤系統 (id, name, color, description)
- **record_tags**: 記錄標籤關聯 (recordId, tagId)
- **financial_periods**: 財務期間 (id, name, startDate, endDate, isActive)
- **activity_logs**: 活動日誌 (id, userId, action, details, recordId, timestamp)

### 部署步驟

#### 1. 環境準備
- Node.js 16+
- MySQL 8.0+
- Azure 帳戶 (若部署至 Azure)

#### 2. 資料庫設定
1. 建立 MySQL 資料庫
2. 執行 `backend/db-schema.sql` 建立表格和初始資料
3. 更新 `backend/config/db.js` 中的資料庫連線資訊

#### 3. 後端部署
1. 安裝依賴: `npm install`
2. 設定環境變數:
   - `DB_HOST`: 資料庫主機
   - `DB_USER`: 資料庫使用者
   - `DB_PASSWORD`: 資料庫密碼
   - `DB_NAME`: 資料庫名稱
   - `DB_PORT`: 資料庫埠號
   - `JWT_SECRET`: JWT 密鑰
   - `PORT`: 伺服器埠號 (預設 5001)
3. 啟動伺服器: `npm start`

#### 4. 前端部署
1. 安裝依賴: `npm install`
2. 設定環境變數:
   - `VITE_API_URL`: 後端 API URL
3. 建置: `npm run build`
4. 部署 `dist` 資料夾至靜態網站託管服務

#### 5. Azure 部署配置
- 使用 Azure App Service 部署後端
- 使用 Azure Static Web Apps 部署前端
- 設定 Azure Database for MySQL

### 預設帳戶
- **管理員**: admin@example.com / pw1234
- **一般使用者**: user2@example.com / pw1234

### API 端點
- `POST /api/auth/login` - 登入
- `GET /api/auth/me` - 取得目前使用者
- `GET /api/records` - 取得記錄列表
- `POST /api/records` - 新增記錄
- `PUT /api/records/:id` - 更新記錄
- `DELETE /api/records/:id` - 刪除記錄
- `GET /api/users` - 取得使用者列表 (管理員)
- `GET /api/departments` - 取得部門列表
- `GET /api/tags` - 取得標籤列表

### 安全性考量
- JWT Token 驗證
- 密碼 bcrypt 加密
- 基於角色的存取控制 (RBAC)
- SQL 注入防護
- CORS 設定

### 監控與維護
- 檢查資料庫連線狀態
- 監控 API 回應時間
- 定期備份資料庫
- 更新安全性套件

### 疑難排解
#### 常見錯誤

1. **"Unknown column 'department'"**
   - 問題：SQL 查詢使用了不存在的欄位
   - 解決：使用 `departmentId` 並透過 JOIN 取得 `departmentName`

2. **"Unknown column 'accessLevel'"**
   - 問題：資料庫中沒有 `accessLevel` 欄位
   - 解決：基於 `isPublic` 和 `isConfidential` 計算 `accessLevel`

3. **404 或 500 錯誤**
   - 檢查資料庫連線設定
   - 確認環境變數正確設定
   - 查看伺服器日誌檔案
   - 驗證 API 端點可用性

### 聯絡資訊
如有部署相關問題，請聯絡系統管理員。
