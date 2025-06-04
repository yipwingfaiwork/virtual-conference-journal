
import { User, ConferenceRecord, AccessLevel } from '@/lib/types';

export class PermissionService {
  static canUserViewRecord(user: User, record: ConferenceRecord): boolean {
    // Admin can view all records
    if (user.isAdmin) return true;
    
    // Check access level
    switch (record.accessLevel) {
      case 'PUBLIC':
        return true;
        
      case 'DEPARTMENT':
        // Can view if same department or if specifically allowed
        return user.departmentId === record.departmentId || 
               record.allowedDepartments?.includes(user.departmentId) ||
               record.allowedUsers?.includes(user.id);
               
      case 'RESTRICTED':
        // Only specific users/departments or higher access levels
        const hasAccess = record.allowedUsers?.includes(user.id) ||
                         record.allowedDepartments?.includes(user.departmentId);
        return hasAccess || user.accessLevel >= 3;
        
      case 'CONFIDENTIAL':
        // Only admin, creator, or specifically allowed users
        return user.isAdmin || 
               record.createdBy === user.id ||
               record.allowedUsers?.includes(user.id);
               
      default:
        return false;
    }
  }
  
  static canUserEditRecord(user: User, record: ConferenceRecord): boolean {
    // Admin can edit all records
    if (user.isAdmin) return true;
    
    // Must be able to view first
    if (!this.canUserViewRecord(user, record)) return false;
    
    // Access level 1 (Basic) cannot edit
    if (user.accessLevel < 2) return false;
    
    // Creator can edit their own records
    if (record.createdBy === user.id) return true;
    
    // Same department supervisors/managers can edit department records
    if (user.departmentId === record.departmentId && user.accessLevel >= 2) {
      return true;
    }
    
    // Manager level can edit if specifically allowed
    if (user.accessLevel >= 3 && record.allowedUsers?.includes(user.id)) {
      return true;
    }
    
    return false;
  }
  
  static canUserDeleteRecord(user: User, record: ConferenceRecord): boolean {
    // Only admin can delete records
    if (user.isAdmin) return true;
    
    // Manager level (3+) can delete their own records
    if (user.accessLevel >= 3 && record.createdBy === user.id) return true;
    
    return false;
  }
  
  static canUserCreateRecord(user: User): boolean {
    // Access level 2+ can create records
    return user.accessLevel >= 2;
  }
  
  static getAccessibleDepartments(user: User): string[] {
    if (user.isAdmin || user.accessLevel >= 3) {
      return ['all']; // Can access all departments
    }
    
    return [user.departmentId]; // Only own department
  }
}
