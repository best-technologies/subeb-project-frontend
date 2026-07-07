import api from "@/lib/axios";
import { ApiResponse } from "./types";

export interface SessionData {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED';
  isCurrent: boolean;
  createdAt: string;
}

export interface TermData {
  id: string;
  name: string;
  sessionId: string;
  status: 'OPEN' | 'CLOSED';
  isCurrent: boolean;
  createdAt: string;
}

// Session APIs
export async function getSessions(): Promise<ApiResponse<SessionData[]>> {
  const response = await api.get("/academic/sessions");
  return response.data;
}

export async function createSession(data: Record<string, unknown>): Promise<ApiResponse> {
  const response = await api.post("/academic/sessions", data);
  return response.data;
}

export async function updateSessionStatus(id: string, status: 'OPEN' | 'CLOSED'): Promise<ApiResponse> {
  const response = await api.put(`/academic/sessions/${id}/status`, { status });
  return response.data;
}

export async function activateSession(id: string): Promise<ApiResponse> {
  const response = await api.put(`/academic/sessions/${id}/activate`);
  return response.data;
}

// Term APIs
export async function getTerms(sessionId?: string): Promise<ApiResponse<TermData[]>> {
  const query = sessionId ? `?sessionId=${sessionId}` : '';
  const response = await api.get(`/academic/terms${query}`);
  return response.data;
}

export async function createTerm(data: Record<string, unknown>): Promise<ApiResponse> {
  const response = await api.post("/academic/terms", data);
  return response.data;
}

export async function updateTermStatus(id: string, status: 'OPEN' | 'CLOSED'): Promise<ApiResponse> {
  const response = await api.put(`/academic/terms/${id}/status`, { status });
  return response.data;
}

export async function activateTerm(id: string): Promise<ApiResponse> {
  const response = await api.put(`/academic/terms/${id}/activate`);
  return response.data;
}
