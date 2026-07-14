"use client";

import React, { useState } from "react";
import { useExamOfficerAuditLogs } from "@/services/hooks/useExamOfficer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Pagination from "@/components/shared/Pagination";

export default function ExamOfficerAuditLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data: response, isLoading } = useExamOfficerAuditLogs({ page: currentPage, limit });
  const logs = response?.data;
  const pagination = response?.pagination;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Track your past approval and rejection actions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
        <div className="overflow-x-auto flex-grow">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : logs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log: any) => {
                  let details: any = {};
                  try {
                    details = JSON.parse(log.details);
                  } catch (e) {}

                  return (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        {log.action === "RESULT_APPROVAL" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : log.action === "RESULT_REJECTION" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {log.action}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {details.schoolName || "Unknown School"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {log.action === "RESULT_APPROVAL" && `Approved ${details.count || 0} assessments.`}
                        {log.action === "RESULT_REJECTION" && `Rejected ${details.count || 0} assessments.`}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}