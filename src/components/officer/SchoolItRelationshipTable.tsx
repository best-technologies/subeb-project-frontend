"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  School as SchoolIcon,
  Laptop,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  UserX,
  Building2,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface SchoolItOfficerInfo {
  id: string;
  schoolItId: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  assignedAt?: string;
}

export interface SchoolActiveTermStats {
  termId: string;
  termName: string;
  awaitingApprovalCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalAssessedCount: number;
  status: "AWAITING_APPROVAL" | "APPROVED" | "REJECTED" | "NO_RESULTS";
  lastSubmissionDate: string | null;
}

export interface SchoolItRelationshipItem {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  schoolLevel: string;
  lgaName: string;
  totalStudents: number;
  itOfficer: SchoolItOfficerInfo | null;
  activeTermStats: SchoolActiveTermStats;
}

interface SchoolItRelationshipTableProps {
  schools: SchoolItRelationshipItem[];
  activeTermName?: string;
  activeSessionName?: string;
}

export function SchoolItRelationshipTable({
  schools,
  activeTermName,
  activeSessionName,
}: SchoolItRelationshipTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter schools based on search and status
  const filteredSchools = useMemo(() => {
    return schools.filter((item) => {
      const matchesSearch =
        item.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.schoolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.itOfficer?.name &&
          item.itOfficer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.itOfficer?.email &&
          item.itOfficer.email.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === "WITH_IT") {
        matchesStatus = !!item.itOfficer;
      } else if (statusFilter === "UNASSIGNED_IT") {
        matchesStatus = !item.itOfficer;
      } else if (statusFilter === "AWAITING_APPROVAL") {
        matchesStatus = item.activeTermStats?.status === "AWAITING_APPROVAL";
      } else if (statusFilter === "APPROVED") {
        matchesStatus = item.activeTermStats?.status === "APPROVED";
      } else if (statusFilter === "NO_RESULTS") {
        matchesStatus =
          !item.activeTermStats || item.activeTermStats.status === "NO_RESULTS";
      }

      return matchesSearch && matchesStatus;
    });
  }, [schools, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage) || 1;
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchools.slice(start, start + itemsPerPage);
  }, [filteredSchools, currentPage, itemsPerPage]);

  // Overall metric counts for filter badges
  const totalAssignedCount = useMemo(
    () => schools.filter((s) => !!s.itOfficer).length,
    [schools]
  );
  const totalUnassignedCount = schools.length - totalAssignedCount;
  const totalAwaitingCount = useMemo(
    () =>
      schools.filter((s) => s.activeTermStats?.status === "AWAITING_APPROVAL")
        .length,
    [schools]
  );
  const totalApprovedCount = useMemo(
    () =>
      schools.filter((s) => s.activeTermStats?.status === "APPROVED").length,
    [schools]
  );

  const getStatusBadge = (status?: string, awaitingCount: number = 0) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case "AWAITING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Awaiting Review ({awaitingCount})
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Needs Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            No Upload Yet
          </span>
        );
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <Laptop className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">
                School IT Personnel & Academic Submissions
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Analytical relationship between School IT officers, their assigned schools, and examination results in{" "}
              <strong>{activeSessionName || "Current Session"}</strong> -{" "}
              <strong>{activeTermName ? activeTermName.replace(/_/g, " ") : "Current Term"}</strong>.
            </CardDescription>
          </div>

          {/* Quick Filter Counts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({schools.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter("WITH_IT");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "WITH_IT"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60"
              }`}
            >
              IT Assigned ({totalAssignedCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter("UNASSIGNED_IT");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "UNASSIGNED_IT"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60"
              }`}
            >
              Unassigned IT ({totalUnassignedCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter("AWAITING_APPROVAL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "AWAITING_APPROVAL"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200/60"
              }`}
            >
              Awaiting Review ({totalAwaitingCount})
            </button>
            <button
              onClick={() => {
                setStatusFilter("APPROVED");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
              }`}
            >
              Approved ({totalApprovedCount})
            </button>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by school name, code, or IT officer name/email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs text-gray-500 hover:text-gray-800 underline px-2 py-1"
            >
              Clear search
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-b border-gray-200/80 text-xs uppercase font-semibold text-gray-500 tracking-wider">
                <TableHead className="py-3.5 px-6">School Details</TableHead>
                <TableHead className="py-3.5 px-6">School IT Person</TableHead>
                <TableHead className="py-3.5 px-6">Contact Info</TableHead>
                <TableHead className="py-3.5 px-6 text-center">Enrolled Students</TableHead>
                <TableHead className="py-3.5 px-6">Active Term Results</TableHead>
                <TableHead className="py-3.5 px-6">Submission Status</TableHead>
                <TableHead className="py-3.5 px-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">No schools found</h4>
                      <p className="text-sm text-gray-500 max-w-sm mt-1">
                        {searchQuery || statusFilter !== "ALL"
                          ? "No schools in this LGA match your search or filter criteria. Try adjusting your filter."
                          : "No schools are registered in your assigned LGA."}
                      </p>
                      {(searchQuery || statusFilter !== "ALL") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("ALL");
                            setCurrentPage(1);
                          }}
                          className="mt-4 px-4 py-2 text-xs font-semibold text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSchools.map((item) => {
                  const it = item.itOfficer;
                  const stats = item.activeTermStats;
                  const hasResults =
                    stats && (stats.totalAssessedCount > 0 || stats.status !== "NO_RESULTS");

                  return (
                    <TableRow
                      key={item.schoolId}
                      className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                    >
                      {/* 1. School Details */}
                      <TableCell className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <SchoolIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-sm block capitalize leading-tight">
                              {item.schoolName}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                {item.schoolCode}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium capitalize">
                                {item.schoolLevel ? item.schoolLevel.toLowerCase() : "Primary"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. School IT Officer */}
                      <TableCell className="py-4 px-6">
                        {it ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center shrink-0">
                              {it.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 text-sm block">
                                {it.name}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active Staff
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                            <UserX className="w-3.5 h-3.5 text-amber-500" />
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* 3. Contact Info */}
                      <TableCell className="py-4 px-6">
                        {it ? (
                          <div className="space-y-1 text-xs">
                            <a
                              href={`mailto:${it.email}`}
                              className="flex items-center gap-1.5 text-gray-600 hover:text-brand-primary transition-colors truncate max-w-[180px]"
                              title={it.email}
                            >
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{it.email}</span>
                            </a>
                            {it.phone && (
                              <a
                                href={`tel:${it.phone}`}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{it.phone}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No contact available</span>
                        )}
                      </TableCell>

                      {/* 4. Enrolled Students */}
                      <TableCell className="py-4 px-6 text-center">
                        <span className="font-semibold text-gray-900 text-sm">
                          {item.totalStudents.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-gray-400 block">Students</span>
                      </TableCell>

                      {/* 5. Active Term Results */}
                      <TableCell className="py-4 px-6">
                        <div className="space-y-1.5 min-w-[130px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-800">
                              {stats?.totalAssessedCount || 0} Assessed
                            </span>
                            {item.totalStudents > 0 && stats?.totalAssessedCount ? (
                              <span className="text-[11px] font-medium text-gray-500">
                                {Math.round(
                                  ((stats.totalAssessedCount || 0) / item.totalStudents) * 100
                                )}
                                %
                              </span>
                            ) : null}
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-brand-primary h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  item.totalStudents > 0 && stats?.totalAssessedCount
                                    ? Math.min(
                                        100,
                                        Math.round(
                                          (stats.totalAssessedCount / item.totalStudents) * 100
                                        )
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* 6. Submission Status */}
                      <TableCell className="py-4 px-6">
                        {getStatusBadge(stats?.status, stats?.awaitingApprovalCount)}
                      </TableCell>

                      {/* 7. Action */}
                      <TableCell className="py-4 px-6 text-right">
                        {hasResults ? (
                          <Link
                            href={`/officer/results/${item.schoolId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors group"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No action</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer with Pagination */}
        {filteredSchools.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <strong className="text-gray-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(currentPage * itemsPerPage, filteredSchools.length)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredSchools.length}</strong> schools
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-medium text-gray-700 px-3">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
