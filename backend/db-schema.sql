
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
  departmentId INT,
  accessLevelId INT DEFAULT 1,
  isAdmin BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (accessLevelId) REFERENCES access_levels(id) ON DELETE SET NULL
);

-- Enhanced Records table with access control
CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  duration VARCHAR(100) NOT NULL,
  departmentId INT NOT NULL,
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
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (departmentId) REFERENCES departments(id),
  FOREIGN KEY (financialPeriodId) REFERENCES financial_periods(id) ON DELETE SET NULL
);

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

-- Update existing users to use new structure
UPDATE users u 
LEFT JOIN departments d ON d.name = u.department 
SET u.departmentId = d.id 
WHERE d.id IS NOT NULL;

UPDATE users u 
LEFT JOIN access_levels al ON al.level = u.accessLevel 
SET u.accessLevelId = al.id 
WHERE al.id IS NOT NULL;

-- Update existing records to use new structure
UPDATE records r 
LEFT JOIN departments d ON d.name = r.department 
SET r.departmentId = d.id 
WHERE d.id IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX idx_records_date ON records(date);
CREATE INDEX idx_records_department ON records(departmentId);
CREATE INDEX idx_records_access_level ON records(accessLevel);
CREATE INDEX idx_records_created_by ON records(createdBy);
CREATE INDEX idx_record_tags_record ON record_tags(recordId);
CREATE INDEX idx_record_tags_tag ON record_tags(tagId);
CREATE INDEX idx_record_changes_record ON record_changes(recordId);
CREATE INDEX idx_activity_logs_user ON activity_logs(userId);
CREATE INDEX idx_activity_logs_record ON activity_logs(recordId);
