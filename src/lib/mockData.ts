
import { ConferenceRecord, ActivityLog } from './types';

export const conferenceRecords: ConferenceRecord[] = [
  {
    id: "1",
    date: "2023-08-15",
    duration: "1 hour",
    department: "Operations",
    title: "Quarterly Operations Review",
    participants: ["Level 1 User", "Level 2 User", "Level 3 User"],
    videoLink: "https://example.com/video1",
    textRecord: "This meeting covered the quarterly operations review, discussing production metrics, efficiency improvements, and upcoming challenges.",
    outline: "1. Production Metrics\n2. Efficiency Improvements\n3. Upcoming Challenges",
    createdBy: "4", // Level 1 User
    createdAt: "2023-08-15T10:00:00Z",
    updatedAt: "2023-08-15T10:00:00Z"
  },
  {
    id: "2",
    date: "2023-08-20",
    duration: "2 hours",
    department: "Finance",
    title: "Budget Planning Session",
    participants: ["Level 2 User", "Level 3 User", "Admin User"],
    videoLink: "https://example.com/video2",
    textRecord: "The finance team reviewed Q3 performance and started planning for the Q4 budget allocation. Key discussion points included marketing spend, R&D investments, and operational cost management.",
    outline: "1. Q3 Performance Review\n2. Q4 Budget Planning\n3. Investment Priorities",
    createdBy: "3", // Level 2 User
    createdAt: "2023-08-20T14:00:00Z",
    updatedAt: "2023-08-21T09:30:00Z"
  },
  {
    id: "3",
    date: "2023-08-25",
    duration: "1.5 hours",
    department: "Management",
    title: "Strategic Direction Meeting",
    participants: ["Level 3 User", "Admin User"],
    videoLink: "https://example.com/video3",
    textRecord: "The management team discussed the company's strategic direction for the next fiscal year, focusing on market expansion, product development roadmap, and organizational growth.",
    outline: "1. Market Expansion Strategy\n2. Product Development Roadmap\n3. Organizational Growth Plan",
    createdBy: "2", // Level 3 User
    createdAt: "2023-08-25T13:00:00Z",
    updatedAt: "2023-08-25T15:00:00Z"
  },
  {
    id: "4",
    date: "2023-08-30",
    duration: "1 hour",
    department: "Administration",
    title: "Company Policy Update",
    participants: ["Admin User", "Level 3 User", "Level 2 User", "Level 1 User"],
    videoLink: "https://example.com/video4",
    textRecord: "This all-hands meeting introduced updates to company policies, including remote work guidelines, security protocols, and benefits changes.",
    outline: "1. Remote Work Policy Updates\n2. Security Protocol Changes\n3. Benefits Enhancements",
    createdBy: "1", // Admin User
    createdAt: "2023-08-30T11:00:00Z",
    updatedAt: "2023-08-30T12:15:00Z"
  }
];

export const activityLogs: ActivityLog[] = [
  {
    id: "1",
    userId: "1",
    action: "Login",
    details: "Admin user logged in",
    timestamp: "2023-08-30T08:00:00Z"
  },
  {
    id: "2",
    userId: "1",
    action: "Create Record",
    details: "Created conference record: Company Policy Update",
    timestamp: "2023-08-30T11:00:00Z"
  },
  {
    id: "3",
    userId: "2",
    action: "Login",
    details: "Level 3 user logged in",
    timestamp: "2023-08-25T12:45:00Z"
  },
  {
    id: "4",
    userId: "2",
    action: "Create Record",
    details: "Created conference record: Strategic Direction Meeting",
    timestamp: "2023-08-25T13:00:00Z"
  },
  {
    id: "5",
    userId: "3",
    action: "Login",
    details: "Level 2 user logged in",
    timestamp: "2023-08-20T13:50:00Z"
  },
  {
    id: "6",
    userId: "3",
    action: "Create Record",
    details: "Created conference record: Budget Planning Session",
    timestamp: "2023-08-20T14:00:00Z"
  },
  {
    id: "7",
    userId: "4",
    action: "Login",
    details: "Level 1 user logged in",
    timestamp: "2023-08-15T09:45:00Z"
  },
  {
    id: "8",
    userId: "4",
    action: "Create Record",
    details: "Created conference record: Quarterly Operations Review",
    timestamp: "2023-08-15T10:00:00Z"
  }
];
