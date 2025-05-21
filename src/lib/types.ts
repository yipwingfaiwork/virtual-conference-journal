
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  accessLevel: 1 | 2 | 3;
  isAdmin: boolean;
}

export interface ConferenceRecord {
  id: string;
  date: string;
  duration: string;
  department: string;
  title: string;
  participants: string[];
  importFromAI: boolean;
  videoLink: string;
  textRecord: string;
  outline: string;
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
};
