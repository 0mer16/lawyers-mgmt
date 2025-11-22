// Define types used throughout the application

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LAWYER';
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}

// For partial user data from relations
export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  cnic: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  title: string;
  caseNumber: string | null;
  court: string | null;
  judge: string | null;
  description: string | null;
  status: 'ACTIVE' | 'PENDING' | 'CLOSED' | 'WON' | 'LOST' | 'SETTLED';
  fillingDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lawyer: UserInfo | null;
  clients: Client[];
  hearings?: Hearing[];
  documents?: Document[];
}

export interface Hearing {
  id: string;
  title: string;
  date: Date;
  location: string | null;
  notes: string | null;
  outcome: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
  caseId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  case: Case;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  caseId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 