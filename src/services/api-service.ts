
import axios from 'axios';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
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
