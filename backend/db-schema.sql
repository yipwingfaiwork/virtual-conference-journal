
-- Clean Database schema for Relax Hotel Conference Record System

CREATE DATABASE IF NOT EXISTS relax_hotel_system;
USE relax_hotel_system;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (simplified)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  address TEXT,
  departmentId INT NOT NULL,
  TelegramId VARCHAR(255),
  isAdmin BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT
);

-- Tags table for record classification
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
  name VARCHAR(100) NOT NULL UNIQUE,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  isActive BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conference records table (simplified access control)
CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  duration VARCHAR(100) NOT NULL,
  departmentId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  participants JSON,
  videoLink TEXT,
  MeetingFullRecord TEXT,
  MeetingOutline TEXT,
  remark TEXT,
  createdBy INT NOT NULL,
  financialPeriodId INT,
  isPublic BOOLEAN DEFAULT false,
  isConfidential BOOLEAN DEFAULT false,
  aiTranslate BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT,
  FOREIGN KEY (financialPeriodId) REFERENCES financial_periods(id) ON DELETE SET NULL
);

-- Record tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS record_tags (
  recordId INT NOT NULL,
  tagId INT NOT NULL,
  PRIMARY KEY (recordId, tagId),
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- Activity logs table (simplified)
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  recordId INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (recordId) REFERENCES records(id) ON DELETE SET NULL
);

-- Insert default departments
INSERT IGNORE INTO departments (name, description) VALUES 
('Management', 'Executive and senior management'),
('Operations', 'Day-to-day operations'),
('Finance', 'Financial operations and accounting'),
('Administration', 'Administrative support'),
('Marketing', 'Marketing and sales'),
('HR', 'Human resources');

-- Insert default tags
INSERT IGNORE INTO tags (name, color, description) VALUES 
('wedding', '#FF6B9D', 'Wedding planning meetings'),
('conference', '#4ECDC4', 'Conference and event planning'),
('daily-report', '#45B7D1', 'Daily operational reports'),
('budget', '#FFA07A', 'Budget and financial discussions'),
('training', '#98D8C8', 'Staff training sessions'),
('strategy', '#F06292', 'Strategic planning meetings'),
('emergency', '#FF5722', 'Emergency meetings'),
('routine', '#607D8B', 'Routine operational meetings');

-- Insert default financial periods
INSERT IGNORE INTO financial_periods (name, startDate, endDate, isActive) VALUES 
('Q1 2024', '2024-01-01', '2024-03-31', false),
('Q2 2024', '2024-04-01', '2024-06-30', false),
('Q3 2024', '2024-07-01', '2024-09-30', false),
('Q4 2024', '2024-10-01', '2024-12-31', false),
('Q1 2025', '2025-01-01', '2025-03-31', true);

-- Sample users (password is hashed version of 'pw1234')
INSERT IGNORE INTO users (name, email, password, phone, address, departmentId, isAdmin) VALUES 
('Admin User', 'admin@example.com', '$2a$12$Ju7vjk4.0c3bsrXnb.XvBuVnrop4oBI10wGMwGaqS2E8u9O6bEICS', '123-456-7890', '123 Admin St', 1, true),
('John Manager', 'user2@example.com', '$2a$12$Ju7vjk4.0c3bsrXnb.XvBuVnrop4oBI10wGMwGaqS2E8u9O6bEICS', '123-456-7891', '124 Manager Ave', 2, false),
('Jane Supervisor', 'user3@example.com', '$2a$12$Ju7vjk4.0c3bsrXnb.XvBuVnrop4oBI10wGMwGaqS2E8u9O6bEICS', '123-456-7892', '125 Supervisor Blvd', 3, false),
('Bob User', 'user4@example.com', '$2a$12$Ju7vjk4.0c3bsrXnb.XvBuVnrop4oBI10wGMwGaqS2E8u9O6bEICS', '123-456-7893', '126 User Lane', 4, false);

-- Sample records
INSERT IGNORE INTO records (date, duration, departmentId, title, participants, videoLink, MeetingFullRecord, MeetingOutline, remark, createdBy, financialPeriodId, isPublic, isConfidential, aiTranslate) VALUES 
('2024-12-01 10:00:00', '2 hours', 1, 'Q4 Strategic Planning', '["Admin User", "John Manager"]', 'https://example.com/video1', 'Strategic planning meeting discussing Q4 objectives and 2025 roadmap.', '1. Review Q4 performance\n2. Set 2025 goals\n3. Budget allocation', 'Follow up on action items next week', 1, 5, false, false, false),
('2024-12-02 14:00:00', '1.5 hours', 2, 'Daily Operations Review', '["John Manager", "Jane Supervisor"]', '', 'Daily review of operational metrics and team performance.', '1. Review metrics\n2. Address issues\n3. Plan improvements', '', 2, 5, true, false, true),
('2024-12-03 09:00:00', '45 minutes', 3, 'Budget Meeting', '["Jane Supervisor", "Admin User"]', '', 'Quarterly budget review and financial planning.', '1. Review expenses\n2. Budget projections\n3. Cost optimization', 'Confidential budget information', 3, 5, false, true, false);

-- Link sample records to tags
INSERT IGNORE INTO record_tags (recordId, tagId) VALUES 
(1, 6), -- Strategic planning -> strategy
(2, 3), -- Daily review -> daily-report
(2, 8), -- Daily review -> routine
(3, 4); -- Budget meeting -> budget

-- Create indexes for performance (Azure MySQL compatible syntax)
CREATE INDEX idx_records_date ON records(date);
CREATE INDEX idx_records_department ON records(departmentId);
CREATE INDEX idx_records_created_by ON records(createdBy);
CREATE INDEX idx_users_department ON users(departmentId);
CREATE INDEX idx_activity_logs_user ON activity_logs(userId);
CREATE INDEX idx_activity_logs_record ON activity_logs(recordId);
CREATE INDEX idx_records_MeetingFullRecord ON records(MeetingFullRecord(255));
CREATE INDEX idx_records_MeetingOutline ON records(MeetingOutline(255));
