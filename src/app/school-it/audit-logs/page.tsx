"use client";

import React, { useState } from "react";
import { useSchoolItAuditLogs } from "@/services/hooks/useSchoolIt";
import { AuditLogsTable } from "@/components/audit-logs/AuditLogsTable";

export default function SchoolItAuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: response, isLoading } = useSchoolItAuditLogs({ page, limit });
  const logs = response?.data || [];
  const pagination = response?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  return (
    <div className="space-y-6">
      <AuditLogsTable
        title="Audit Logs"
        subtitle="Track your student enrollments, result uploads, and school IT activities."
        logs={logs}
        isLoading={isLoading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
