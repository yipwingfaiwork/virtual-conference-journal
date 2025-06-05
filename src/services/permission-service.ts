
import { User, ConferenceRecord } from '@/lib/types';

export class PermissionService {
  static canUserViewRecord(user: User, record: ConferenceRecord): boolean {
    // Admin can view all records
    if (user.isAdmin) return true;
    
    // Public records can be viewed by anyone
    if (record.isPublic) return true;
    
    // Confidential records can only be viewed by creator or admin
    if (record.isConfidential) {
      return record.createdBy === user.id || user.isAdmin;
    }
    
    // Department records can be viewed by same department or creator
    return user.departmentId === record.departmentId || record.createdBy === user.id;
  }
  
  static canUserEditRecord(user: User, record: ConferenceRecord): boolean {
    // Admin can edit all records
    if (user.isAdmin) return true;
    
    // Must be able to view first
    if (!this.canUserViewRecord(user, record)) return false;
    
    // Creator can edit their own records
    if (record.createdBy === user.id) return true;
    
    // For non-confidential department records, same department users can edit
    if (!record.isConfidential && user.departmentId === record.departmentId) {
      return true;
    }
    
    return false;
  }
  
  static canUserDeleteRecord(user: User, record: ConferenceRecord): boolean {
    // Only admin or creator can delete records
    return user.isAdmin || record.createdBy === user.id;
  }
  
  static canUserCreateRecord(user: User): boolean {
    // All active users can create records
    return user.isActive;
  }
  
  static getAccessibleDepartments(user: User): string[] {
    if (user.isAdmin) {
      return ['all']; // Can access all departments
    }
    
    return [user.departmentId]; // Only own department
  }
}
