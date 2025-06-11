
import axios from 'axios';
import { ConferenceRecord, SearchFilters } from '../lib/types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log every request
apiClient.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url, request.params, request.data);
  return request;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Log every response
apiClient.interceptors.response.use(response => {
  console.log('API Response:', response.status, response.config.url, response.data);
  return response;
}, error => {
  console.error('API Error:', error.response?.status, error.config.url, error.response?.data);
  return Promise.reject(error);
});

export const RecordsAPI = {
  getAll: async (filters: SearchFilters = {}) => {
    console.log('API call with filters:', filters);
    
    // Process filters to remove empty values and format properly
    const processedFilters: any = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'tags' && Array.isArray(value)) {
          // Handle tags array - convert to comma-separated string if needed by backend
          processedFilters[key] = value.filter(tag => tag && tag.toString().trim() !== '');
        } else if (typeof value === 'string' && value.trim() !== '') {
          processedFilters[key] = value.trim();
        } else if (typeof value !== 'string') {
          processedFilters[key] = value;
        }
      }
    });
    
    console.log('Processed filters:', processedFilters);
    
    const response = await apiClient.get('/records', { params: processedFilters });
    console.log('API response:', response.data);
    return response.data;
  },
  
  getById: async (id: string): Promise<ConferenceRecord> => {
    const response = await apiClient.get(`/records/${id}`);
    return response.data;
  },
  
  create: async (recordData: Partial<ConferenceRecord>): Promise<ConferenceRecord> => {
    const response = await apiClient.post('/records', recordData);
    return response.data;
  },
  
  update: async (id: string, data: Partial<ConferenceRecord>): Promise<ConferenceRecord> => {
    const response = await apiClient.put(`/records/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/records/${id}`);
  },
};

export const ActivityLogsAPI = {
  getAll: async (params: any = {}) => {
    const response = await apiClient.get('/activity-logs', { params });
    return response.data;
  },
};

export const badgeVariants = {
  default: "default",
  secondary: "secondary", 
  destructive: "destructive",
  outline: "outline",
  success: "success",
  warning: "warning"
} as const;

export default apiClient;
