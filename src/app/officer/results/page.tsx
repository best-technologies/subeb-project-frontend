"use client";

import React, { useState } from "react";
import { 
  useExamOfficerResults, 
  useApproveSchoolResults, 
  useRejectSchoolResults 
} from "@/services/hooks/useExamOfficer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Search, Clock, ShieldCheck, MoreVertical, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useRouter } from "next/navigation";

type StatusTab = "ALL" | "AWAITING_APPROVAL" | "APPROVED";

export default function ExamOfficerResults() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, type: 'APPROVE' | 'REJECT', school: any | null }>({
    isOpen: false,
    type: 'APPROVE',
    school: null
  });

  const { data: schools, isLoading } = useExamOfficerResults(activeTab);
  const approveMutation = useApproveSchoolResults();
  const rejectMutation = useRejectSchoolResults();

  const handleAction = (type: 'APPROVE' | 'REJECT', school: any) => {
    setConfirmDialog({ isOpen: true, type, school });
  };

  const confirmAction = () => {
    if (!confirmDialog.school) return;
    
    if (confirmDialog.type === 'APPROVE') {
      approveMutation.mutate(confirmDialog.school.id, {
        onSuccess: () => setConfirmDialog({ isOpen: false, type: 'APPROVE', school: null })
      });
    } else {
      rejectMutation.mutate(confirmDialog.school.id, {
        onSuccess: () => setConfirmDialog({ isOpen: false, type: 'REJECT', school: null })
      });
    }
  };

  const filteredSchools = schools?.filter((school: any) => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    school.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Results</h1>
          <p className="text-gray-500 mt-1">Review and approve results submitted by schools in your LGA.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          
          {/* Pill Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg space-x-1">
            {[
              { id: "ALL", label: "All Schools" },
              { id: "AWAITING_APPROVAL", label: "Awaiting Approval" },
              { id: "APPROVED", label: "Approved" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StatusTab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search school name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-full md:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>School Code</TableHead>
                <TableHead>Results Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredSchools?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No schools found for the selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchools?.map((school: any) => (
                  <TableRow key={school.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{school.name}</TableCell>
                    <TableCell className="text-gray-500">{school.code}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{school.stats.total}/{school.stats.totalEnrolled}</span> students
                    </TableCell>
                    <TableCell>
                      {school.overallStatus === "AWAITING_APPROVAL" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3.5 h-3.5" />
                          Awaiting Approval
                        </span>
                      )}
                      {school.overallStatus === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                      {school.overallStatus === "NO_RESULTS" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Submitted
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {school.overallStatus === "AWAITING_APPROVAL" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => router.push(`/officer/results/${school.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Results
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction('APPROVE', school)}
                              className="text-green-600 focus:text-green-700 cursor-pointer"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Results
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction('REJECT', school)}
                              className="text-red-600 focus:text-red-700 cursor-pointer"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Results
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                          <MoreVertical className="h-4 w-4 text-gray-400 opacity-90" />
                        </Button>
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
                ? `Are you sure you want to approve all submitted results for ${confirmDialog.school?.name}? They will be marked as Approved and visible to students.`
                : `Are you sure you want to reject the results for ${confirmDialog.school?.name}? They will be sent back to the School IT for correction.`
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