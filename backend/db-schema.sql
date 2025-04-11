
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

-- Insert some sample users (password hashed using bcrypt in production)
INSERT INTO users (name, email, password, phone, address, department, accessLevel, isAdmin)
VALUES 
('Admin User', 'admin@example.com', '$2b$10$OQ8jPvmBDvlRwrJEX0NO/uKaPErtZZMvZEz8TRF.fXp/v4wV5TMY.', '123-456-7890', '123 Admin St', 'Management', 3, true),
('Regular User', 'user@example.com', '$2b$10$AzPS3uOqLy7IYgNeiAmOneJm65IG5QUhCFDcTzSQDYKVoACKGVnym', '098-765-4321', '456 User Ave', 'Operations', 1, false);
-- Passwords are: admin123 and user123
