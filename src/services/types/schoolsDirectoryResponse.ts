export interface SchoolLgaInfo {
  id: string;
  name: string;
  code?: string;
}

export interface SchoolDirectoryItem {
  id: string;
  name: string;
  code: string;
  level: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  principalName?: string | null;
  establishedYear?: number | null;
  capacity?: number | null;
  lga: SchoolLgaInfo;
  totalClasses: number;
  totalStudents: number;
  assessedStudents: number;
  averageScore: number;
}

export interface SchoolsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  startIndex: number;
  endIndex: number;
}

export interface SchoolsDirectoryData {
  pagination: SchoolsPagination;
  data: SchoolDirectoryItem[];
}

export interface SchoolsDirectoryResponse {
  success: boolean;
  message: string;
  data: SchoolsDirectoryData;
}

export interface SchoolQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  session?: string;
  term?: string;
  lgaId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
