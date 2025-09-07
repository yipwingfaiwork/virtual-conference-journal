-- SQL commands to add Manager role functionality to existing database
-- Run these commands on your existing database

-- 1. Add isManager column to users table
ALTER TABLE users ADD COLUMN isManager BOOLEAN NOT NULL DEFAULT FALSE AFTER isAdmin;

-- 2. Update existing indexes if needed
-- Note: Check if any existing indexes need to be updated for performance
-- CREATE INDEX idx_users_isManager ON users(isManager);

-- 3. Sample data update (optional - uncomment if you want to set some users as managers)
-- UPDATE users SET isManager = TRUE WHERE id IN (2, 3); -- Example: Set user IDs 2 and 3 as managers

-- 4. Verify the change
-- SELECT id, name, email, departmentId, isAdmin, isManager FROM users;