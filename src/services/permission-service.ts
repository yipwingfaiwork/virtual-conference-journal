
import { User, ConferenceRecord } from '@/lib/types';

export class PermissionService {
  static canUserViewRecord(user: User, record: ConferenceRecord): boolean {
    // Admin can view all records
    if (user.isAdmin) return true;
    
    // Manager can view PUBLIC, DEPARTMENT, and CONFIDENTIAL records
    if (user.isManager) return true;
    
    // Public records can be viewed by anyone
    if (record.isPublic) return true;
    
    // Department records can be viewed by same department users
    if (!record.isConfidential && user.departmentId === record.departmentId) {
      return true;
    }
    
    // Confidential records can only be viewed by creator
    if (record.isConfidential && record.createdBy === user.id) {
      return true;
    }
    
    return false;
  }
  
  static canUserEditRecord(user: User, record: ConferenceRecord): boolean {
    // Admin can edit all records
    if (user.isAdmin) return true;
    
    // Manager permissions
    if (user.isManager) {
      // Can edit PUBLIC records
      if (record.isPublic) return true;
      
      // Can edit same department DEPARTMENT records
      if (!record.isConfidential && user.departmentId === record.departmentId) {
        return true;
      }
      
      // Can edit own CONFIDENTIAL records
      if (record.isConfidential && record.createdBy === user.id) {
        return true;
      }
      
      return false;
    }
    
    // Regular user permissions - can only edit their own records
    return record.createdBy === user.id;
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
  
  static getUserRole(user: User): 'Administrator' | 'Manager' | 'User' {
    if (user.isAdmin) return 'Administrator';
    if (user.isManager) return 'Manager';
    return 'User';
  }
}
