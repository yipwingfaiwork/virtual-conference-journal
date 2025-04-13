
// This file re-exports functions from auth-service.ts for compatibility
import { AuthService, getAuthenticatedUser, getCachedUser } from '../services/auth-service';
import apiClient from '../services/api-service';
import { User } from './types';

// Re-export existing authentication functions
export const login = AuthService.login;
export const logout = AuthService.logout;
export const getCurrentUser = getAuthenticatedUser;
export { getCachedUser };
export const isAuthenticated = AuthService.isAuthenticated;

// Add missing functions that are referenced in other components
export const canUserModifyRecord = (currentUser: User | null | string, recordCreatorId: string): boolean => {
  // Admin users can modify any record
  if (typeof currentUser === 'object' && currentUser?.isAdmin) {
    return true;
  }
  
  // Users can only modify their own records
  const userId = typeof currentUser === 'object' ? currentUser?.id : currentUser;
  return userId === recordCreatorId;
};

export const canUserDeleteRecord = (currentUser: User | null | string): boolean => {
  // Only admin users can delete records
  if (typeof currentUser === 'object' && currentUser) {
    return !!currentUser.isAdmin;
  }
  return false;
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put(`/users/${userData.id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const changePassword = async (
  userId: string, 
  oldPassword: string, 
  newPassword: string
): Promise<boolean> => {
  try {
    await apiClient.post(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword
    });
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
