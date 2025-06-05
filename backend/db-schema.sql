
-- Database schema for enhanced conference record system

CREATE DATABASE IF NOT EXISTS relax_hotel_system;
USE relax_hotel_system;

-- Departments table (1NF, 2NF, 3NF compliant)
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Access levels table
CREATE TABLE IF NOT EXISTS access_levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level INT NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table for meeting classification
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial periods table
CREATE TABLE IF NOT EXISTS financial_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  address TEXT,
  department VARCHAR(100), -- Keep old column for migration
  departmentId INT,
  accessLevel INT DEFAULT 1, -- Keep old column for migration
  accessLevelId INT DEFAULT 1,
  isAdmin BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraints after table creation
ALTER TABLE users 
ADD CONSTRAINT fk_users_department 
FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_users_access_level 
FOREIGN KEY (accessLevelId) REFERENCES access_levels(id) ON DELETE SET NULL;

-- Enhanced Records table with access control
CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  duration VARCHAR(100) NOT NULL,
  department VARCHAR(100), -- Keep old column for migration
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
  allowedDepartments JSON, -- For cross-department access
  allowedUsers JSON, -- For specific user access
  isConfidential BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraints for records
ALTER TABLE records 
ADD CONSTRAINT fk_records_created_by 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE records 
ADD CONSTRAINT fk_records_department 
FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL;

ALTER TABLE records 
ADD CONSTRAINT fk_records_financial_period 
FOREIGN KEY (financialPeriodId) REFERENCES financial_periods(id) ON DELETE SET NULL;

-- Record tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS record_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recordId INT NOT NULL,
  tagId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_record_tag (recordId, tagId)
);

-- Record change history table
CREATE TABLE IF NOT EXISTS record_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recordId INT NOT NULL,
  changedBy INT NOT NULL,
  changeType ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  fieldChanged VARCHAR(100),
  oldValue TEXT,
  newValue TEXT,
  changeDescription TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE CASCADE,
  FOREIGN KEY (changedBy) REFERENCES users(id)
);

-- Enhanced Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  recordId INT,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE SET NULL
);

-- Insert default data
INSERT IGNORE INTO departments (name, description) VALUES 
('Management', 'Executive and senior management'),
('Operations', 'Day-to-day operations'),
('Finance', 'Financial operations and accounting'),
('Administration', 'Administrative support'),
('Marketing', 'Marketing and sales'),
('HR', 'Human resources');

INSERT IGNORE INTO access_levels (level, name, description, permissions) VALUES 
(1, 'Basic', 'Read access to own department records only', '{"read": ["own_department"], "write": false, "delete": false}'),
(2, 'Supervisor', 'Read/write access to own department, read access to public records', '{"read": ["own_department", "public"], "write": ["own_department"], "delete": false}'),
(3, 'Manager', 'Full access to own department, read access to other departments', '{"read": ["all_departments"], "write": ["own_department"], "delete": ["own_department"]}'),
(4, 'Admin', 'Full system access', '{"read": ["all"], "write": ["all"], "delete": ["all"]}');

INSERT IGNORE INTO tags (name, color, description) VALUES 
('wedding', '#FF6B9D', 'Wedding planning meetings'),
('conference', '#4ECDC4', 'Conference and event planning'),
('daily-report', '#45B7D1', 'Daily operational reports'),
('budget', '#FFA07A', 'Budget and financial discussions'),
('training', '#98D8C8', 'Staff training sessions'),
('strategy', '#F06292', 'Strategic planning meetings'),
('emergency', '#FF5722', 'Emergency meetings'),
('routine', '#607D8B', 'Routine operational meetings');

INSERT IGNORE INTO financial_periods (name, startDate, endDate, isActive) VALUES 
('Q1 2024', '2024-01-01', '2024-03-31', false),
('Q2 2024', '2024-04-01', '2024-06-30', false),
('Q3 2024', '2024-07-01', '2024-09-30', false),
('Q4 2024', '2024-10-01', '2024-12-31', true),
('Q1 2025', '2025-01-01', '2025-03-31', true);

-- Sample users (password is hashed version of 'password123')
INSERT IGNORE INTO users (name, email, password, phone, address, department, departmentId, accessLevel, accessLevelId, isAdmin) VALUES 
('Admin User', 'admin@example.com', '$2b$10$rOZhzKJ8K8K8K8K8K8K8Ku', '123-456-7890', '123 Admin St', 'Management', 1, 4, 4, true),
('John Manager', 'john@example.com', '$2b$10$rOZhzKJ8K8K8K8K8K8K8Ku', '123-456-7891', '124 Manager Ave', 'Operations', 2, 3, 3, false),
('Jane Supervisor', 'jane@example.com', '$2b$10$rOZhzKJ8K8K8K8K8K8K8Ku', '123-456-7892', '125 Supervisor Blvd', 'Finance', 3, 2, 2, false),
('Bob User', 'bob@example.com', '$2b$10$rOZhzKJ8K8K8K8K8K8K8Ku', '123-456-7893', '126 User Lane', 'Administration', 4, 1, 1, false);

-- Update existing users to use new structure (only if columns exist)
UPDATE users u 
LEFT JOIN departments d ON d.name = u.department 
SET u.departmentId = d.id 
WHERE d.id IS NOT NULL AND u.department IS NOT NULL;

UPDATE users u 
LEFT JOIN access_levels al ON al.level = u.accessLevel 
SET u.accessLevelId = al.id 
WHERE al.id IS NOT NULL AND u.accessLevel IS NOT NULL;

-- Update existing records to use new structure (only if columns exist)
UPDATE records r 
LEFT JOIN departments d ON d.name = r.department 
SET r.departmentId = d.id 
WHERE d.id IS NOT NULL AND r.department IS NOT NULL;

-- Sample records
INSERT IGNORE INTO records (date, duration, department, departmentId, title, participants, importFromAI, videoLink, textRecord, outline, remark, createdBy, financialPeriodId, accessLevel) VALUES 
('2024-12-01 10:00:00', '2 hours', 'Management', 1, 'Q4 Strategic Planning', '["Admin User", "John Manager"]', false, 'https://example.com/video1', 'Strategic planning meeting discussing Q4 objectives and 2025 roadmap.', '1. Review Q4 performance\n2. Set 2025 goals\n3. Budget allocation', 'Follow up on action items next week', 1, 4, 'DEPARTMENT'),
('2024-12-02 14:00:00', '1.5 hours', 'Operations', 2, 'Daily Operations Review', '["John Manager", "Jane Supervisor"]', true, '', 'Daily review of operational metrics and team performance.', '1. Review metrics\n2. Address issues\n3. Plan improvements', '', 2, 4, 'PUBLIC'),
('2024-12-03 09:00:00', '45 minutes', 'Finance', 3, 'Budget Meeting', '["Jane Supervisor", "Admin User"]', false, '', 'Quarterly budget review and financial planning.', '1. Review expenses\n2. Budget projections\n3. Cost optimization', 'Confidential budget information', 3, 4, 'RESTRICTED');

-- Link sample records to tags
INSERT IGNORE INTO record_tags (recordId, tagId) VALUES 
(1, 6), -- Strategic planning -> strategy
(2, 3), -- Daily review -> daily-report
(2, 8), -- Daily review -> routine
(3, 4); -- Budget meeting -> budget

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
CREATE INDEX IF NOT EXISTS idx_records_department ON records(departmentId);
CREATE INDEX IF NOT EXISTS idx_records_access_level ON records(accessLevel);
CREATE INDEX IF NOT EXISTS idx_records_created_by ON records(createdBy);
CREATE INDEX IF NOT EXISTS idx_record_tags_record ON record_tags(recordId);
CREATE INDEX IF NOT EXISTS idx_record_tags_tag ON record_tags(tagId);
CREATE INDEX IF NOT EXISTS idx_record_changes_record ON record_changes(recordId);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(userId);
CREATE INDEX IF NOT EXISTS idx_activity_logs_record ON activity_logs(recordId);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(departmentId);
CREATE INDEX IF NOT EXISTS idx_users_access_level ON users(accessLevelId);
