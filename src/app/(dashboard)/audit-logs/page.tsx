"use client";

import React, { useState } from "react";
import { useAuditLogs } from "@/services/hooks/useAudit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

function formatAction(action: string) {
  if (!action) return "Unknown Action";
  if (action.includes("subeb-officers/enroll")) return "Enrolled SUBEB Officer";
  if (action.includes("students/enrollsingleorbulkstudents")) return "Enrolled Student(s)";
  if (action.startsWith("POST ")) return "Created Record";
  if (action.startsWith("PUT ")) return "Updated Record";
  if (action.startsWith("DELETE ")) return "Deleted Record";
  return action;
}

function formatDetails(details: string) {
  if (!details) return "N/A";
  try {
    const parsed = JSON.parse(details);
    
    if (parsed.students && Array.isArray(parsed.students)) {
      const count = parsed.students.length;
      return `Enrolled ${count} student(s)${count > 0 ? ` (e.g., ${parsed.students[0].firstName} ${parsed.students[0].lastName})` : ""}`;
    }
    
    if (parsed.firstName && parsed.lastName) {
      return `Name: ${parsed.firstName} ${parsed.lastName}, Email: ${parsed.email || "N/A"}`;
    }
    
    // Generic fallback for JSON
    const parts = [];
    for (const [key, value] of Object.entries(parsed)) {
       if (typeof value === 'string' || typeof value === 'number') {
           parts.push(`${key}: ${value}`);
       }
    }
    if (parts.length > 0) return parts.join(", ");
    
    return details;
  } catch {
    return details;
  }
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useAuditLogs(page, limit);

  const logs = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Review system activities and admin actions</p>
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
                <TableHead className="w-[15%]">User ID</TableHead>
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
                    <TableCell className="text-gray-600 font-mono text-xs">
                      {log.userId}
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {formatAction(log.action)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{log.entity}</span>
                        {log.entityId && log.entityId !== "N/A" && (
                           <span className="text-xs text-gray-500 font-mono mt-0.5">ID: {log.entityId}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm text-gray-600 truncate" title={log.details}>
                        {formatDetails(log.details)}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-9 px-3"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
