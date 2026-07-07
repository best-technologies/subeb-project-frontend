import api from "@/lib/axios";
import { ApiResponse } from "./types";

export interface AuditLogData {
  id: string;
  userId: string;
  action: string;
  details: string; // JSON string or text
  entity: string;
  entityId: string;
  createdAt: string;
}

export async function getAuditLogs(page = 1, limit = 20): Promise<ApiResponse<AuditLogData[]>> {
  const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
  return response.data;
}
