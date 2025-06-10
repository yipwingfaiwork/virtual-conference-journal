
import axios from 'axios';

// Get API base URL from environment variable, fallback to Azure production URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const fallbackUrl = 'https://n8n-api-d3b9a0f3g4a3e4dc.uksouth-01.azurewebsites.net/api';
  
  console.log('Environment VITE_API_URL:', envUrl);
  console.log('Using API URL:', envUrl || fallbackUrl);
  
  return envUrl || fallbackUrl;
};

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message, error.config?.url);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Define the filters interface
interface RecordFilters {
  searchTerm?: string;
  department?: string;
  tags?: string[];
  financialPeriod?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  accessLevel?: string;
  [key: string]: any; // Allow additional properties
}

// Records API methods
export const RecordsAPI = {
  getAll: async (filters: RecordFilters = {}) => {
    try {
      console.log('API call with filters:', filters);
      
      // Process filters to handle arrays properly
      const processedFilters = { ...filters };
      
      // Handle tags array
      if (processedFilters.tags && Array.isArray(processedFilters.tags)) {
        processedFilters.tags = processedFilters.tags.filter(tag => tag && tag.trim() !== '');
      }
      
      // Remove empty values
      Object.keys(processedFilters).forEach(key => {
        if (processedFilters[key] === '' || processedFilters[key] === null || processedFilters[key] === undefined) {
          delete processedFilters[key];
        }
        if (Array.isArray(processedFilters[key]) && processedFilters[key].length === 0) {
          delete processedFilters[key];
        }
      });
      
      console.log('Processed filters:', processedFilters);
      
      const response = await apiClient.get('/records', { params: processedFilters });
      console.log('API response:', response.data);
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

// Activity Logs API methods (admin only)
export const ActivityLogsAPI = {
  getAll: async (filters: RecordFilters = {}) => {
    try {
      const response = await apiClient.get('/activity-logs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }
};

// Define badge variants to match the ones from src/components/ui/badge.tsx
export const badgeVariants = {
  default: "default",
  secondary: "secondary",
  destructive: "destructive",
  outline: "outline",
  success: "success",
  warning: "warning"
} as const;

export default apiClient;
