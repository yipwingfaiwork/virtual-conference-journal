
import axios from 'axios';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Records API methods
export const RecordsAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await apiClient.get('/records', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching record ${id}:`, error);
      throw error;
    }
  },
  
  create: async (recordData: any) => {
    try {
      const response = await apiClient.post('/records', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  },
  
  update: async (id: string, recordData: any) => {
    try {
      const response = await apiClient.put(`/records/${id}`, recordData);
      return response.data;
    } catch (error) {
      console.error(`Error updating record ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting record ${id}:`, error);
      throw error;
    }
  }
};

export default apiClient;
