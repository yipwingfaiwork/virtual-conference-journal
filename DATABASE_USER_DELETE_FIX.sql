-- Migration to fix user deletion foreign key constraints
-- This allows users to be deleted while preserving record integrity

USE relax_hotel_system;

-- First, drop the existing foreign key constraints
ALTER TABLE records DROP FOREIGN KEY records_ibfk_1;
ALTER TABLE activity_logs DROP FOREIGN KEY activity_logs_ibfk_1;

-- Recreate the constraints with ON DELETE SET NULL to allow user deletion
-- while preserving record data (createdBy will be set to NULL)
ALTER TABLE records 
ADD CONSTRAINT records_ibfk_1 
FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_ibfk_1 
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Ensure createdBy column allows NULL values (should already be the case)
ALTER TABLE records MODIFY COLUMN createdBy INT NULL;
ALTER TABLE activity_logs MODIFY COLUMN userId INT NULL;

-- Add index for better performance on NULL checks
CREATE INDEX idx_records_created_by_null ON records(createdBy) WHERE createdBy IS NULL;
CREATE INDEX idx_activity_logs_user_null ON activity_logs(userId) WHERE userId IS NULL;

-- Update any existing records where the creator no longer exists (cleanup)
UPDATE records SET createdBy = NULL WHERE createdBy NOT IN (SELECT id FROM users);
UPDATE activity_logs SET userId = NULL WHERE userId NOT IN (SELECT id FROM users);