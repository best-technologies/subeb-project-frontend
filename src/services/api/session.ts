// Academic Session and Term types
export interface Term {
  id: string;
  sessionId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  terms: Term[];
}

export interface CurrentSessionResponse {
  success: boolean;
  data?: AcademicSession;
  message?: string;
}
