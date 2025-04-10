import { User } from './types';
import apiClient from '../services/api-service';
import { AuthService, getCachedUser as getCachedUserService, getAuthenticatedUser } from '../services/auth-service';

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = await AuthService.login(email, password);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await AuthService.logout();
};

// Async function to get user data - might make API call
export const getCurrentUser = async (): Promise<User | null> => {
  return await getAuthenticatedUser();
};

// Sync function to get cached user - won't make API call
export const getCachedUser = (): User | null => {
  return getCachedUserService();
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  try {
    const response = await apiClient.put(`/users/${updatedUser.id}`, updatedUser);
    const user = response.data;
    
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

// Update these functions to accept either User object or string for user ID
export const canUserAccessRecord = (user: User | null | string, createdByUserId: string): boolean => {
  // If user is a string (userId), consider it a valid access
  if (typeof user === 'string') return true;
  if (!user) return false;
  return true; // Or implement your actual access logic
};

export const canUserModifyRecord = (user: User | null | string, createdByUserId: string): boolean => {
  // If user is a string (userId), consider it's the admin (this is temporary until proper user data is available)
  if (typeof user === 'string') return true;
  if (!user) return false;
  // Simple logic: users can modify their own records or if they're admin
  return user.id === createdByUserId || user.isAdmin;
};

export const canUserDeleteRecord = (user: User | null | string): boolean => {
  // If user is a string (userId), consider it's the admin (this is temporary until proper user data is available)
  if (typeof user === 'string') return true;
  if (!user) return false;
  return user.isAdmin; // Only admins can delete records
};

// Export mocked data temporarily until the API is complete
export const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    phone: "123-456-7890",
    address: "123 Admin St",
    department: "Management",
    accessLevel: 3,
    isAdmin: true
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    phone: "098-765-4321",
    address: "456 User Ave",
    department: "Operations",
    accessLevel: 1,
    isAdmin: false
  }
];

// Export these mock data for temporary use until API is complete
export const activityLogs = [
  {
    id: "1",
    userId: "1",
    action: "Login",
    details: "User logged in successfully",
    timestamp: "2023-05-01T08:30:00Z"
  },
  {
    id: "2",
    userId: "2",
    action: "Record Created",
    details: "Created new conference record",
    timestamp: "2023-05-01T09:15:00Z"
  },
  {
    id: "3",
    userId: "1",
    action: "Record Updated",
    details: "Updated conference record",
    timestamp: "2023-05-01T10:45:00Z"
  }
];

export const conferenceRecords = [
  {
    id: "1",
    date: "2023-05-01",
    duration: "1 hour",
    department: "Operations",
    title: "Weekly Operations Meeting",
    participants: ["John Smith", "Jane Doe", "Robert Johnson"],
    videoLink: "https://example.com/video1",
    textRecord: "Discussed upcoming projects and resource allocation.",
    outline: "1. Project Updates\n2. Resource Planning\n3. Open Issues",
    createdBy: "1",
    createdAt: "2023-05-01T08:00:00Z",
    updatedAt: "2023-05-01T08:00:00Z"
  },
  {
    id: "2",
    date: "2023-05-02",
    duration: "30 minutes",
    department: "Finance",
    title: "Budget Review",
    participants: ["Alice Brown", "Bob Miller"],
    videoLink: "https://example.com/video2",
    textRecord: "Reviewed quarterly budget and approved expenditures.",
    outline: "1. Budget Overview\n2. Expense Reports\n3. Projections",
    createdBy: "2",
    createdAt: "2023-05-02T14:00:00Z",
    updatedAt: "2023-05-02T14:00:00Z"
  }
];
