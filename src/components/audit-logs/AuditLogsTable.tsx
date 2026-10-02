"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

export interface AuditLogItem {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  details: any;
  entity: string;
  entityId?: string;
  createdAt: string;
}

export function formatAction(action: string) {
  if (!action) return "Unknown Action";
  if (action === "USER_LOGIN" || action === "LOGIN" || (action.includes("auth/login") && action.startsWith("POST"))) return "User Signed In";
  if (action === "USER_LOGOUT" || action === "LOGOUT" || (action.includes("auth/logout") && action.startsWith("POST"))) return "User Signed Out";
  if (action === "RESULT_APPROVAL" || (action.includes("exam-officer/results") && action.includes("approve"))) return "Approved Results";
  if (action === "RESULT_REJECTION" || (action.includes("exam-officer/results") && action.includes("reject"))) return "Rejected Results";
  if (action === "UPLOADED_RESULTS" || (action.includes("school-it/results/upload"))) return "Uploaded Results";
  if (action === "SUBMITTED_RESULTS" || (action.includes("school-it/results/submit"))) return "Submitted Results";
  if (action === "ENROLLED_STUDENT" || (action.includes("school-it/students") && action.startsWith("POST"))) return "Enrolled Student";
  if (action === "UPDATED_STUDENT" || (action.includes("school-it/students") && (action.startsWith("PUT") || action.startsWith("PATCH")))) return "Updated Student";
  
  if (action.includes("subeb-officers/enroll") || action.includes("subeb-officers")) return "Enrolled SUBEB Officer";
  if (action.includes("students/enrollsingleorbulkstudents") || action.includes("enrollment/students") || action.includes("admin/enrollment")) return "Enrolled Student(s)";
  
  if (action.includes("academic/classes") && action.startsWith("POST")) return "Created Class";
  if (action.includes("academic/classes") && (action.startsWith("PATCH") || action.startsWith("PUT"))) return "Updated Class";
  if (action.includes("academic/classes") && action.startsWith("DELETE")) return "Deleted Class";
  
  if (action.includes("academic/sessions") && action.startsWith("POST")) return "Created Session";
  if (action.includes("academic/sessions") && (action.startsWith("PATCH") || action.startsWith("PUT"))) return "Updated Session";
  if (action.includes("academic/sessions") && action.startsWith("DELETE")) return "Deleted Session";

  if (action.includes("academic/terms") && action.startsWith("POST")) return "Created Term";
  if (action.includes("academic/terms") && (action.startsWith("PATCH") || action.startsWith("PUT"))) return "Updated Term";
  if (action.includes("academic/terms") && action.startsWith("DELETE")) return "Deleted Term";

  if (action.includes("admin/schools") && action.startsWith("POST")) return "Added School";
  if (action.includes("admin/schools") && (action.startsWith("PATCH") || action.startsWith("PUT"))) return "Updated School";
  if (action.includes("admin/schools") && action.startsWith("DELETE")) return "Deleted School";

  if (action.includes("auth/profile") || action.includes("exam-officer/profile") || action === "UPDATED_PROFILE") return "Updated Profile";

  if (action.startsWith("POST ")) return "Created Record";
  if (action.startsWith("PUT ") || action.startsWith("PATCH ")) return "Updated Record";
  if (action.startsWith("DELETE ")) return "Deleted Record";
  return action;
}

export function formatDetails(action: string, details: any) {
  const formattedAction = formatAction(action);
  
  if (formattedAction === "Submitted Results") {
    return "Submitted results for approval.";
  }
  
  if (formattedAction === "Approved Results" && (!details || details === "{}" || (typeof details === "object" && Object.keys(details).length === 0))) {
    return "Approved results for a school.";
  }
  
  if (!details || details === "{}" || (typeof details === "object" && Object.keys(details).length === 0)) return "N/A";
  
  try {
    let parsed: any = details;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {}
    }
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {}
    }
    if (!parsed || typeof parsed !== "object") {
      parsed = {};
    }

    if (formattedAction === "User Signed In") {
      const roleStr = parsed.role ? ` (${parsed.role.replace(/_/g, " ")})` : "";
      return parsed.email
        ? `${parsed.name ? `${parsed.name} (${parsed.email})` : parsed.email}${roleStr} signed in.`
        : "User signed in.";
    }

    if (formattedAction === "User Signed Out") {
      const roleStr = parsed.role ? ` (${parsed.role.replace(/_/g, " ")})` : "";
      return parsed.email
        ? `${parsed.name ? `${parsed.name} (${parsed.email})` : parsed.email}${roleStr} signed out.`
        : "User signed out.";
    }
    
    if (formattedAction === "Approved Results" || formattedAction === "Rejected Results") {
      const verb = formattedAction === "Approved Results" ? "Approved" : "Rejected";
      return `${verb} results for ${parsed.count || 0} student(s) at ${parsed.schoolName || 'a school'}.`;
    }
    
    if (formattedAction === "Uploaded Results") {
      const count = parsed.students ? parsed.students.length : (parsed.totalStudents || 0);
      return `Uploaded results for ${count} student(s) in class ${parsed.classId || 'Unknown'}.`;
    }
    
    if (formattedAction === "Enrolled Student" || formattedAction === "Updated Student") {
      const name = parsed.name || (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ''}` : "Unknown");
      return `Student: ${name.trim()}, ID: ${parsed.studentId || "N/A"}`;
    }

    if (formattedAction === "Enrolled Student(s)") {
      if (parsed.students && Array.isArray(parsed.students)) {
        const count = parsed.students.length;
        const sample = parsed.students[0];
        const name = sample ? (sample.firstName || sample?.student?.firstName || "Unknown") : undefined;
        return `Enrolled ${count} student(s)${name && name !== "Unknown" ? ` (e.g., ${name})` : ""}`;
      }
    }
    
    if (formattedAction === "Enrolled SUBEB Officer") {
      return `Name: ${parsed.firstName || 'Unknown'} ${parsed.lastName || ''}, Email: ${parsed.email || "N/A"}`;
    }

    if (formattedAction === "Created Class" || formattedAction === "Updated Class" || formattedAction === "Deleted Class") {
      if (parsed.name) return `Class Name: ${parsed.name}${parsed.code ? ` (${parsed.code})` : ""}`;
    }

    if (formattedAction === "Created Session" || formattedAction === "Updated Session" || formattedAction === "Deleted Session") {
      if (parsed.name || parsed.status) return `Session: ${parsed.name || "N/A"}${parsed.status ? `, Status: ${parsed.status}` : ""}`;
    }

    if (formattedAction === "Created Term" || formattedAction === "Updated Term" || formattedAction === "Deleted Term") {
      if (parsed.name || parsed.status) return `Term: ${parsed.name || "N/A"}${parsed.status ? `, Status: ${parsed.status}` : ""}`;
    }

    if (formattedAction === "Added School" || formattedAction === "Updated School" || formattedAction === "Deleted School") {
      if (parsed.name) return `School Name: ${parsed.name}${parsed.code ? ` (${parsed.code})` : ""}`;
    }

    if (formattedAction === "Updated Profile") {
      const name = parsed.firstName || parsed.lastName ? `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() : "";
      return `Updated profile information${name ? `: ${name}` : ""}`;
    }
    
    // Generic fallback for JSON
    const parts = [];
    for (const [key, value] of Object.entries(parsed)) {
       if (typeof value === 'string' || typeof value === 'number') {
           parts.push(`${key}: ${value}`);
       }
    }
    if (parts.length > 0) return parts.join(", ");
    
    return typeof details === "string" ? details : JSON.stringify(details);
  } catch {
    return typeof details === "string" ? details : JSON.stringify(details);
  }
}

interface AuditLogsTableProps {
  title?: string;
  subtitle?: string;
  logs: AuditLogItem[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function AuditLogsTable({
  title = "Audit Logs",
  subtitle = "Review system activities and actions",
  logs,
  isLoading,
  total,
  page,
  totalPages,
  onPageChange,
}: AuditLogsTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-lg font-medium">
          <FileText size={20} />
          Total Logs: {total}
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100 p-4">
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-brand-accent-background">
              <TableRow>
                <TableHead className="w-[15%]">Date & Time</TableHead>
                <TableHead className="w-[15%]">User</TableHead>
                <TableHead className="w-[15%]">Action</TableHead>
                <TableHead className="w-[15%]">Entity</TableHead>
                <TableHead className="w-[40%]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading audit logs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">
                      {log.userName || log.userId}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          formatAction(log.action) === "User Signed In"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : formatAction(log.action) === "User Signed Out"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : formatAction(log.action).startsWith("Deleted") ||
                              formatAction(log.action).includes("Rejected")
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-800">{log.entity}</span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div
                        className="text-sm text-gray-600 truncate"
                        title={typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                      >
                        {formatDetails(log.action, log.details)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="h-9 px-3"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
              className="h-9 px-3"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
