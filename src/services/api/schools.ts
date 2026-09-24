import api from "@/lib/axios";

export interface CreateSchoolPayload {
  name: string;
  level: "PRIMARY" | "SECONDARY";
  lgaId: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  principalPhone?: string;
  principalEmail?: string;
  establishedYear?: number;
  capacity?: number;
  totalStudents?: number;
  totalTeachers?: number;
}

export type UpdateSchoolPayload = Partial<CreateSchoolPayload>;

export interface SchoolDetailData {
  id: string;
  name: string;
  code: string;
  level: "PRIMARY" | "SECONDARY";
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  principalName?: string | null;
  principalPhone?: string | null;
  principalEmail?: string | null;
  establishedYear?: number | null;
  totalStudents: number;
  totalTeachers: number;
  capacity?: number | null;
  lgaId: string;
  stateId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lga?: {
    id: string;
    name: string;
    code?: string;
  };
}

export interface CreateSchoolResponse {
  statusCode: number;
  message: string;
  data: SchoolDetailData;
}

export interface SchoolDetailResponse {
  statusCode: number;
  message: string;
  data: SchoolDetailData;
}

/**
 * Create a new school in Abia State
 * POST /admin/schools
 */
export async function createSchool(
  payload: CreateSchoolPayload
): Promise<CreateSchoolResponse> {
  const response = await api.post<CreateSchoolResponse>(
    "/admin/schools",
    payload
  );
  return response.data;
}

/**
 * Get school details by ID
 * GET /admin/schools/:id
 */
export async function getSchoolById(id: string): Promise<SchoolDetailResponse> {
  const response = await api.get<SchoolDetailResponse>(`/admin/schools/${id}`);
  return response.data;
}

/**
 * Update school details by ID
 * PATCH /admin/schools/:id
 */
export async function updateSchool(
  id: string,
  payload: UpdateSchoolPayload
): Promise<CreateSchoolResponse> {
  const response = await api.patch<CreateSchoolResponse>(
    `/admin/schools/${id}`,
    payload
  );
  return response.data;
}
