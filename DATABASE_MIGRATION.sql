-- SQL commands to migrate existing database to new schema
-- Run these commands on your existing database

-- 1. Add TelegramId column to users table
ALTER TABLE users ADD COLUMN TelegramId VARCHAR(255);

-- 2. Rename textRecord column to MeetingFullRecord in records table  
ALTER TABLE records CHANGE textRecord MeetingFullRecord TEXT;

-- 3. Rename outline column to MeetingOutline in records table
ALTER TABLE records CHANGE outline MeetingOutline TEXT;

-- 4. Update existing indexes (if needed)
-- Note: The existing indexes on textRecord and outline may need to be recreated with new column names
-- Check if these indexes exist first:
-- SHOW INDEX FROM records WHERE Key_name LIKE '%textRecord%' OR Key_name LIKE '%outline%';

-- If indexes exist, drop and recreate them:
-- DROP INDEX idx_records_textRecord ON records;
-- DROP INDEX idx_records_outline ON records;
-- CREATE INDEX idx_records_MeetingFullRecord ON records(MeetingFullRecord(255));
-- CREATE INDEX idx_records_MeetingOutline ON records(MeetingOutline(255));