"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useExamOfficerSchoolResults, useApproveSchoolResults, useRejectSchoolResults } from "@/services/hooks/useExamOfficer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ExamOffierSchoolResultsView({ params }: { params: Promise<{ schoolId: string }> }) {
  const router = useRouter();
  const { schoolId } = use(params);

  const { data: details, isLoading } = useExamOfficerSchoolResults(schoolId);
  const approveMutation = useApproveSchoolResults();
  const rejectMutation = useRejectSchoolResults();

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, type: 'APPROVE' | 'REJECT' }>({
    isOpen: false,
    type: 'APPROVE'
  });

  const handleAction = (type: 'APPROVE' | 'REJECT') => {
    setConfirmDialog({ isOpen: true, type });
  };

  const confirmAction = () => {
    if (confirmDialog.type === 'APPROVE') {
      approveMutation.mutate(schoolId, {
        onSuccess: () => {
          setConfirmDialog({ isOpen: false, type: 'APPROVE' });
          router.push('/officer/results');
        }
      });
    } else {
      rejectMutation.mutate(schoolId, {
        onSuccess: () => {
          setConfirmDialog({ isOpen: false, type: 'REJECT' });
          router.push('/officer/results');
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">Failed to load school details.</div>
      </div>
    );
  }

  const { school, term, students } = details;

  // Determine if we show approve/reject buttons based on whether any student is AWAITING_APPROVAL
  const hasAwaiting = students.some((s: any) => s.status === 'AWAITING_APPROVAL');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/officer/results')} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{school.name} - Results</h1>
          <p className="text-gray-500 mt-1">
            Session: {term.session.name} | Term: {term.name.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900">Submitted Students ({students.length})</h2>
            <p className="text-sm text-gray-500">List of students who have results submitted.</p>
          </div>
          
          {hasAwaiting && (
            <div className="flex gap-3">
              <Button 
                onClick={() => handleAction('REJECT')}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject All
              </Button>
              <Button 
                onClick={() => handleAction('APPROVE')}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve All
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Admission No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Assessments</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No results found for this school.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((data: any) => (
                  <TableRow key={data.student.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {data.student.firstName} {data.student.lastName}
                    </TableCell>
                    <TableCell className="text-gray-500">{data.student.admissionNumber}</TableCell>
                    <TableCell>{data.class.name}</TableCell>
                    <TableCell>{data.assessmentCount} subjects</TableCell>
                    <TableCell>
                      {data.status === "AWAITING_APPROVAL" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3.5 h-3.5" />
                          Awaiting
                        </span>
                      )}
                      {data.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => !isOpen && setConfirmDialog({ ...confirmDialog, isOpen })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === 'APPROVE' ? 'Approve Results' : 'Reject Results'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'APPROVE' 
                ? `Are you sure you want to approve all submitted results for ${school.name}?`
                : `Are you sure you want to reject the results for ${school.name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className={confirmDialog.type === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={confirmAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {(approveMutation.isPending || rejectMutation.isPending) ? 'Processing...' : (confirmDialog.type === 'APPROVE' ? 'Yes, Approve' : 'Yes, Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
