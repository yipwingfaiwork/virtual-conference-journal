
import apiClient from './api-service';
import { User } from '../lib/types';

// Store the current user in memory during the session
let currentUser: User | null = null;

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('authToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize auth token from localStorage when app loads
const token = localStorage.getItem('authToken');
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    setAuthToken(token);
    currentUser = user;
    return user;
  },
  
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      currentUser = null;
    }
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    // Return cached user if available
    if (currentUser) return currentUser;
    
    // Skip request if no token exists
    if (!localStorage.getItem('authToken')) {
      return null;
    }
    
    try {
      const response = await apiClient.get('/auth/me');
      currentUser = response.data;
      return currentUser;
    } catch (error) {
      setAuthToken(null); // Clear invalid token
      currentUser = null;
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};

export const getAuthenticatedUser = async (): Promise<User | null> => {
  return await AuthService.getCurrentUser();
};

// Synchronous method to get cached user - won't make API calls
export const getCachedUser = (): User | null => {
  return currentUser;
};
