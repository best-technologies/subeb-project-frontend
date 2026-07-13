"use client";

import React, { useState } from "react";
import { useSchoolItResults, useUploadSchoolItResults, useSchoolItDashboard, useSubmitSchoolItResults } from "@/services/hooks/useSchoolIt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Upload, Edit2, AlertCircle, MoreVertical, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { ManualResultEntry } from '@/components/school-it/ManualResultEntry';
import Link from 'next/link';
import { useSchoolItSubjects } from '@/services/hooks/useSchoolIt';
import { schoolItApi } from '@/services/api/school-it';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function SchoolItResultsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const dashboardQuery = useSchoolItDashboard();
  const { data, isLoading } = useSchoolItResults({ page, limit });
  const { data: subjectsData } = useSchoolItSubjects();
  const uploadMutation = useUploadSchoolItResults();
  const submitMutation = useSubmitSchoolItResults();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [missingResultsData, setMissingResultsData] = useState<{ hasMissing: boolean; missingCount: number; message: string } | null>(null);
  const [isCheckingMissing, setIsCheckingMissing] = useState(false);
  const [isCsvMode, setIsCsvMode] = useState(true);

  const results = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  // Mock Manual Submission Handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardQuery.data?.school) return;
    
    // In a real implementation, we would parse the CSV or form data here.
    // We send a hardcoded mock payload to test the backend API.
    const mockPayload = {
      sessionId: "mock-session-id",
      termId: "mock-term-id",
      lgaId: dashboardQuery.data.school.lgaId || "mock-lga-id",
      schoolId: dashboardQuery.data.school.id,
      classId: "mock-class-id",
      students: [
        {
          studentId: "mock-student-id",
          subjects: [
            { subjectId: "mock-subject-id", score: 85 }
          ]
        }
      ]
    };

    uploadMutation.mutate(mockPayload, {
      onSuccess: () => setIsUploadModalOpen(false)
    });
  };

  const handleOpenSubmitModal = async () => {
    setIsCheckingMissing(true);
    try {
      const res = await schoolItApi.checkMissingResults();
      setMissingResultsData(res.data);
      setIsSubmitModalOpen(true);
    } catch (err) {
      toast.error("Failed to check missing results");
    } finally {
      setIsCheckingMissing(false);
    }
  };

  const handleConfirmSubmit = () => {
    submitMutation.mutate(undefined, {
      onSuccess: () => setIsSubmitModalOpen(false)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Results</h1>
          <p className="text-gray-600">Total Students: {total}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleOpenSubmitModal} disabled={isCheckingMissing || results.length === 0} className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5">
            <Send size={18} />
            {isCheckingMissing ? 'Checking...' : 'Submit for Approval'}
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
            <Upload size={18} />
            Upload Results
          </Button>
        </div>
      </div>

      {dashboardQuery.data?.activeSession && dashboardQuery.data?.activeTerm && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div>
            <h4 className="font-semibold text-sm">Active Academic Period</h4>
            <p className="text-sm">
              Any results you upload will automatically be attached to the current active session (<strong>{dashboardQuery.data.activeSession.name}</strong>) and term (<strong>{dashboardQuery.data.activeTerm.name.replace('_', ' ')}</strong>). You do not need to manually select them.
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-100">
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subjects Graded</TableHead>
                <TableHead>Overall Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Loading results...
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No results found. Start by uploading some!
                  </TableCell>
                </TableRow>
              ) : (
                results.map((student: any) => {
                  const assessments = student.assessments || [];
                  const totalSubjects = subjectsData?.length || 0;
                  
                  let status = 'NOT GRADED';
                  let statusColor = 'bg-gray-100 text-gray-800';

                  if (assessments.length > 0) {
                    if (assessments.some((a: any) => a.status === 'REJECTED')) {
                      status = 'REJECTED';
                      statusColor = 'bg-red-100 text-red-800';
                    } else if (assessments.some((a: any) => a.status === 'PENDING_SUBMISSION')) {
                      status = 'PENDING SUBMISSION';
                      statusColor = 'bg-gray-100 text-gray-800';
                    } else if (assessments.some((a: any) => a.status === 'AWAITING_APPROVAL')) {
                      status = 'AWAITING APPROVAL';
                      statusColor = 'bg-yellow-100 text-yellow-800';
                    } else {
                      status = 'APPROVED';
                      statusColor = 'bg-green-100 text-green-800';
                    }
                  }

                  return (
                    <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{student.studentId}</TableCell>
                      <TableCell className="text-gray-900">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600">{student.class?.name}</TableCell>
                      <TableCell className="text-gray-600">
                        <span className="font-medium">{assessments.length}</span> / {totalSubjects}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/school-it/results/${student.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Results
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/school-it/results/${student.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Results
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Results Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Results</DialogTitle>
          </DialogHeader>

          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${isCsvMode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setIsCsvMode(true)}
            >
              Bulk Upload (CSV)
            </button>
            <button 
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${!isCsvMode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setIsCsvMode(false)}
            >
              Manual Entry
            </button>
          </div>

          {isCsvMode ? (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start gap-3 mb-4">
                <AlertCircle className="text-yellow-600 mt-0.5" size={18} />
                <div className="text-sm text-yellow-800">
                  If any single result in your batch fails validation, the entire batch will be rejected to prevent partial uploads. You will need to correct the file and try again.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">Upload CSV/Excel File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-4">Drag and drop or click to select</p>
                  <Input id="csvFile" type="file" accept=".csv, .xlsx" className="w-[250px]" />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Submit Results'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <ManualResultEntry 
              dashboardData={dashboardQuery.data} 
              existingResults={results}
              onSuccess={() => setIsUploadModalOpen(false)}
              onCancel={() => setIsUploadModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Results for Approval</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {missingResultsData?.hasMissing ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle size={18} />
                  <span>Missing Results Detected</span>
                </div>
                <p className="text-sm">{missingResultsData.message}</p>
                <p className="text-sm mt-2">Are you sure you want to proceed with submission anyway? The Exam Officer will be able to see these results.</p>
              </div>
            ) : (
              <p className="text-gray-700">
                You are about to submit all draft results for the current term to the LGA Exam Officer for approval. Are you sure you want to proceed?
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : missingResultsData?.hasMissing ? 'Submit Anyway' : 'Submit Results'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
