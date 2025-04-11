
-- Database schema for authentication

CREATE DATABASE IF NOT EXISTS relax_hotel_system;
USE relax_hotel_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Records table for meeting records
CREATE TABLE IF NOT EXISTS records (
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

-- Activity logs table
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

-- Insert some sample users (password hashed using bcrypt in production)
INSERT INTO users (name, email, password, phone, address, department, accessLevel, isAdmin)
VALUES 
('Admin User', 'admin@example.com', '$2b$10$OQ8jPvmBDvlRwrJEX0NO/uKaPErtZZMvZEz8TRF.fXp/v4wV5TMY.', '123-456-7890', '123 Admin St', 'Management', 3, true),
('Regular User', 'user@example.com', '$2b$10$AzPS3uOqLy7IYgNeiAmOneJm65IG5QUhCFDcTzSQDYKVoACKGVnym', '098-765-4321', '456 User Ave', 'Operations', 1, false);
-- Passwords are: admin123 and user123

-- Insert some sample records
INSERT INTO records (date, duration, department, title, participants, videoLink, textRecord, outline, createdBy) VALUES
('2023-11-15', '1 hour', 'Operations', 'Monthly Planning Meeting', '["John Smith", "Jane Doe", "Robert Johnson"]', 'https://example.com/video1', 'This meeting focused on planning for the upcoming month. We discussed resource allocation and project timelines.', '1. Introduction\n2. Resource Planning\n3. Project Timelines\n4. Q&A', 1),
('2023-11-20', '45 minutes', 'Finance', 'Budget Review', '["Alice Brown", "Bob Miller"]', 'https://example.com/video2', 'We reviewed the quarterly budget and approved expenditures for the next quarter.', '1. Budget Overview\n2. Expense Reports\n3. Approval Process', 2),
('2023-11-25', '2 hours', 'Management', 'Strategy Session', '["Admin User", "Jane Doe", "Sam Wilson"]', 'https://example.com/video3', 'Long-term strategy discussion for hotel expansion plans. We identified key markets and potential acquisition targets.', '1. Market Analysis\n2. Expansion Plan\n3. Timeline\n4. Resource Requirements', 1);

-- Insert some sample activity logs
INSERT INTO activity_logs (userId, action, details, recordId) VALUES
(1, 'LOGIN', 'Admin user logged in', NULL),
(1, 'CREATE_RECORD', 'Created new meeting record: Monthly Planning Meeting', 1),
(2, 'LOGIN', 'Regular user logged in', NULL),
(2, 'CREATE_RECORD', 'Created new meeting record: Budget Review', 2),
(1, 'CREATE_RECORD', 'Created new meeting record: Strategy Session', 3),
(1, 'VIEW_RECORD', 'Viewed meeting record: Budget Review', 2);
