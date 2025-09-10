# User Deletion Fix Migration Guide

## Issue
Admin users cannot delete other users due to foreign key constraints in the database.

## Solution
Run the `DATABASE_USER_DELETE_FIX.sql` migration to modify foreign key constraints.

## Steps to Apply Migration

### Option 1: Azure MySQL Database
1. Connect to your Azure MySQL database
2. Execute the `DATABASE_USER_DELETE_FIX.sql` file

### Option 2: Local MySQL
```bash
mysql -u your_username -p relax_hotel_system < DATABASE_USER_DELETE_FIX.sql
```

### Option 3: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open and execute the `DATABASE_USER_DELETE_FIX.sql` file

## What This Migration Does
1. **Removes restrictive foreign key constraints** that prevent user deletion
2. **Adds new constraints** with `ON DELETE SET NULL` to preserve data integrity
3. **Allows NULL values** in `createdBy` and `userId` fields
4. **Cleans up existing orphaned references**

## After Migration
- Admins can delete users (except themselves)
- Records created by deleted users will show `createdBy` as NULL
- Activity logs from deleted users will show `userId` as NULL
- All existing data is preserved

## Backend Changes
The `userController.js` has been updated to:
- Check admin privileges before allowing deletion
- Prevent self-deletion
- Provide better error messages

## Testing
After running the migration:
1. Login as admin
2. Go to Users Management page
3. Try to delete another user (not yourself)
4. Should work successfully without errors