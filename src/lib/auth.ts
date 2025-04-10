
import { User } from './types';
import apiClient from '../services/api-service';

// Store the current user in memory during the session
let currentUser: User | null = null;

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const user = response.data.user;
    
    // Store the JWT token in localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    currentUser = user;
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage and current user
    localStorage.removeItem('authToken');
    currentUser = null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (currentUser) return currentUser;
  
  // Try to get the current user from the API if we have a token
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const response = await apiClient.get('/auth/me');
    currentUser = response.data;
    return currentUser;
  } catch (error) {
    console.error('Error fetching current user:', error);
    localStorage.removeItem('authToken'); // Clear invalid token
    return null;
  }
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  try {
    const response = await apiClient.put(`/users/${updatedUser.id}`, updatedUser);
    const user = response.data;
    
    if (currentUser && currentUser.id === user.id) {
      currentUser = user;
    }
    
    return user;
  } catch (error) {
    console.error('Update user error:', error);
    throw new Error("Failed to update user");
  }
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
  try {
    await apiClient.post(`/users/${userId}/change-password`, { 
      oldPassword, 
      newPassword 
    });
    return true;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
};

export const canUserAccessRecord = async (userId: string, createdByUserId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/users/${userId}/can-access/${createdByUserId}`);
    return response.data.canAccess;
  } catch (error) {
    console.error('Access check error:', error);
    return false;
  }
};

export const canUserModifyRecord = async (userId: string, createdByUserId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/users/${userId}/can-modify/${createdByUserId}`);
    return response.data.canModify;
  } catch (error) {
    console.error('Modify check error:', error);
    return false;
  }
};

export const canUserDeleteRecord = async (userId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/users/${userId}/can-delete`);
    return response.data.canDelete;
  } catch (error) {
    console.error('Delete check error:', error);
    return false;
  }
};
