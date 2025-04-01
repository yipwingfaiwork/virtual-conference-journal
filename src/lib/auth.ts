
import { User } from './types';

// Mock authentication - in a real app, this would connect to a backend
export const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@abc-company.com",
    phone: "123-456-7890",
    address: "123 Admin St, City",
    department: "Administration",
    accessLevel: 3,
    isAdmin: true
  },
  {
    id: "2",
    name: "Level 3 User",
    email: "level3@abc-company.com",
    phone: "123-456-7891",
    address: "123 Main St, City",
    department: "Management",
    accessLevel: 3,
    isAdmin: false
  },
  {
    id: "3",
    name: "Level 2 User",
    email: "level2@abc-company.com",
    phone: "123-456-7892",
    address: "456 Oak St, City",
    department: "Finance",
    accessLevel: 2,
    isAdmin: false
  },
  {
    id: "4",
    name: "Level 1 User",
    email: "level1@abc-company.com",
    phone: "123-456-7893",
    address: "789 Pine St, City",
    department: "Operations",
    accessLevel: 1,
    isAdmin: false
  }
];

let currentUser: User | null = null;

export const login = (email: string, password: string): User | null => {
  // In a real app, you would validate the password
  const user = users.find(u => u.email === email);
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
};

export const logout = (): void => {
  currentUser = null;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const updateUser = (updatedUser: User): User => {
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    if (currentUser && currentUser.id === updatedUser.id) {
      currentUser = updatedUser;
    }
    return updatedUser;
  }
  throw new Error("User not found");
};

export const changePassword = (userId: string, newPassword: string): boolean => {
  // In a real app, you would update the password in the database
  return true;
};

export const canUserAccessRecord = (user: User, createdByUserId: string): boolean => {
  if (user.isAdmin) return true;
  
  if (user.id === createdByUserId) return true;
  
  const createdByUser = users.find(u => u.id === createdByUserId);
  if (!createdByUser) return false;
  
  return user.accessLevel >= createdByUser.accessLevel;
};

export const canUserModifyRecord = (user: User, createdByUserId: string): boolean => {
  if (user.isAdmin) return true;
  
  if (user.id === createdByUserId) return true;
  
  const createdByUser = users.find(u => u.id === createdByUserId);
  if (!createdByUser) return false;
  
  return user.accessLevel > createdByUser.accessLevel;
};

export const canUserDeleteRecord = (user: User): boolean => {
  return user.isAdmin;
};
