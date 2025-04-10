
import apiClient from './api-service';
import { User } from '../lib/types';

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
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
    setAuthToken(null);
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    // Skip request if no token exists
    if (!localStorage.getItem('authToken')) {
      return null;
    }
    
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      setAuthToken(null); // Clear invalid token
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};
