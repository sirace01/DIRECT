
export type UserRole = 'ADMIN' | 'TEACHER';

export interface Laboratory {
  id: string;
  name: string;
  building: string;
  floor: string;
  condition: 'Functional' | 'Maintenance' | 'Closed';
  status: 'Available' | 'Occupied' | 'Reserved';
}

export interface Teacher {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  empNo: string;
  contact: string;
  address: string;
  dob: string;
  subjectTaught: string;
  yearsTeachingSubject: number;
  tesdaQualifications: string[];
  position: string;
  educationBS: string;
  educationMA?: string;
  educationPhD?: string;
  yearsInService: number;
}

export interface ItemAnalysis {
  id: string;
  gradeLevel: number;
  specialization: string;
  quarter: 1 | 2 | 3 | 4;
  totalQuestions: number;
  responses: {
    questionNo: number;
    correctCount: number;
    totalExaminees: number;
  }[];
}

export interface ToolItem {
  id: string;
  labId: string;
  name: string;
  serialNumber: string;
  condition: 'Good' | 'Fair' | 'Defective' | 'Under Maintenance';
  borrower: string | null;
  lastBorrowed: string | null;
}

export interface LabConsumable {
  id: string;
  labId: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  location: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  deadline: string;
  status: 'Pending' | 'Done';
}

export interface Notification {
  id: string;
  type: 'EXPIRY' | 'DEADLINE' | 'SYSTEM';
  message: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}
