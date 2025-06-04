
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  departmentId: string;
  accessLevel: 1 | 2 | 3 | 4;
  accessLevelId: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface AccessLevel {
  id: string;
  level: number;
  name: string;
  description: string;
  permissions: {
    read: string[];
    write: string[] | boolean;
    delete: string[] | boolean;
  };
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  createdAt: string;
}

export interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface ConferenceRecord {
  id: string;
  date: string;
  duration: string;
  department: string;
  departmentId: string;
  title: string;
  participants: string[];
  importFromAI: boolean;
  videoLink: string;
  textRecord: string;
  outline: string;
  remark: string;
  createdBy: string;
  financialPeriodId?: string;
  accessLevel: 'PUBLIC' | 'DEPARTMENT' | 'RESTRICTED' | 'CONFIDENTIAL';
  allowedDepartments?: string[];
  allowedUsers?: string[];
  isConfidential: boolean;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface RecordChange {
  id: string;
  recordId: string;
  changedBy: string;
  changedByName: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changeDescription?: string;
  createdAt: string;
}

export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  details: string;
  recordId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
};

export interface SearchFilters {
  searchTerm?: string;
  department?: string;
  tags?: string[];
  financialPeriod?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  accessLevel?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  duration: string;
  department: string;
  tags: Tag[];
  accessLevel: string;
}
