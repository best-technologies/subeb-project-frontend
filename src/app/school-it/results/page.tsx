"use client";

import React, { useState } from "react";
import { useSchoolItResults, useUploadSchoolItResults, useSchoolItDashboard } from "@/services/hooks/useSchoolIt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Upload, Edit2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { ManualResultEntry } from '@/components/school-it/ManualResultEntry';

export default function SchoolItResultsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const dashboardQuery = useSchoolItDashboard();
  const { data, isLoading } = useSchoolItResults({ page, limit });
  const uploadMutation = useUploadSchoolItResults();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Results</h1>
          <p className="text-gray-600">Total Assessments: {total}</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
          <Upload size={18} />
          Upload Results
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-100">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
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
                results.map((assessment: any) => (
                  <TableRow key={assessment.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">
                      {assessment.student.firstName} {assessment.student.lastName}
                    </TableCell>
                    <TableCell className="text-gray-600">{assessment.class.name}</TableCell>
                    <TableCell className="text-gray-600">{assessment.subject.name}</TableCell>
                    <TableCell className="font-bold">{assessment.score}%</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assessment.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        assessment.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto flex items-center gap-2"
                        disabled={assessment.status === 'APPROVED'}
                        title={assessment.status === 'APPROVED' ? "Approved results cannot be edited" : "Edit result"}
                      >
                        <Edit2 size={14} /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
              onSuccess={() => setIsUploadModalOpen(false)}
              onCancel={() => setIsUploadModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
