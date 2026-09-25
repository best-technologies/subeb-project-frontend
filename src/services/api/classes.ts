import api from "@/lib/axios";
import {
  ClassesResponse,
  ClassAnalyticsResponse,
  ClassQueryParams,
  ClassAnalyticsQueryParams,
  CreateClassRequest,
  UpdateClassRequest,
  ClassItem,
} from "../types/classResponse";

/**
 * Fetch paginated classes with search and filters
 */
export async function getClasses(
  params: ClassQueryParams = {}
): Promise<ClassesResponse> {
  const query = new URLSearchParams();

  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.search && params.search.trim())
    query.append("search", params.search.trim());
  if (params.schoolId) query.append("schoolId", params.schoolId);
  if (params.lgaId) query.append("lgaId", params.lgaId);
  if (params.grade) query.append("grade", params.grade);
  if (params.academicYear) query.append("academicYear", params.academicYear);

  const queryString = query.toString();
  const url = `/admin/classes${queryString ? `?${queryString}` : ""}`;

  const response = await api.get<ClassesResponse>(url);
  return response.data;
}

/**
 * Fetch comprehensive class analytics
 */
export async function getClassAnalytics(
  params: ClassAnalyticsQueryParams = {}
): Promise<ClassAnalyticsResponse> {
  const query = new URLSearchParams();

  if (params.session && params.session !== "ALL_SESSIONS")
    query.append("session", params.session);
  if (params.term && params.term !== "ALL_TERMS")
    query.append("term", params.term);
  if (params.lgaId) query.append("lgaId", params.lgaId);
  if (params.schoolId) query.append("schoolId", params.schoolId);

  const queryString = query.toString();
  const url = `/admin/classes/analytics${queryString ? `?${queryString}` : ""}`;

  const response = await api.get<ClassAnalyticsResponse>(url);
  return response.data;
}

/**
 * Get class details by ID
 */
export async function getClassById(
  id: string
): Promise<{ success: boolean; data: ClassItem; message?: string }> {
  const response = await api.get<{
    success: boolean;
    data: ClassItem;
    message?: string;
  }>(`/admin/classes/${id}`);
  return response.data;
}

/**
 * Create a new class
 */
export async function createClass(
  payload: CreateClassRequest
): Promise<{ success: boolean; data: ClassItem; message?: string }> {
  const response = await api.post<{
    success: boolean;
    data: ClassItem;
    message?: string;
  }>("/admin/classes", payload);
  return response.data;
}

/**
 * Update an existing class
 */
export async function updateClass(
  id: string,
  payload: UpdateClassRequest
): Promise<{ success: boolean; data: ClassItem; message?: string }> {
  const response = await api.patch<{
    success: boolean;
    data: ClassItem;
    message?: string;
  }>(`/admin/classes/${id}`, payload);
  return response.data;
}

/**
 * Delete a class
 */
export async function deleteClass(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/admin/classes/${id}`
  );
  return response.data;
}

/**
 * Get students in a class
 */
export async function getClassStudents(
  id: string
): Promise<{ success: boolean; data: any; message?: string }> {
  const response = await api.get<{
    success: boolean;
    data: any;
    message?: string;
  }>(`/admin/classes/${id}/students`);
  return response.data;
}
