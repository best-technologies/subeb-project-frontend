"use client";

import React, { useState } from "react";
import { useSchoolItStudents, useEnrolSchoolItStudent, useUpdateSchoolItStudent, useSchoolItDashboard } from "@/services/hooks/useSchoolIt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Plus, Edit2 } from "lucide-react";
import { SchoolItStudentModal } from "@/components/school-it/SchoolItStudentModal";

export default function SchoolItStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  const { data, isLoading } = useSchoolItStudents({ page, limit, search });
  const dashboardQuery = useSchoolItDashboard();
  const enrolMutation = useEnrolSchoolItStudent();
  const updateMutation = useUpdateSchoolItStudent();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const students = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;
  const classes = dashboardQuery.data?.classes || [];

  const handleOpenEnrol = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData: any) => {
    if (selectedStudent) {
      updateMutation.mutate(
        { id: selectedStudent.id, data: formData },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      enrolMutation.mutate(formData, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Analytics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-600">Total Enrolled: {total}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 w-[300px]"
            />
          </div>
          <Button onClick={handleOpenEnrol} className="flex items-center gap-2">
            <Plus size={18} />
            Enrol Student
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-100">
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student: any) => (
                  <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      {student.profilePicture ? (
                        <img src={student.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">{student.studentId}</TableCell>
                    <TableCell className="font-medium text-gray-900">{student.firstName} {student.lastName}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(student)} className="flex items-center gap-2 ml-auto">
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
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <SchoolItStudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={enrolMutation.isPending || updateMutation.isPending}
        student={selectedStudent}
        classes={classes}
        schoolId={dashboardQuery.data?.school?.id || ""} // Pass actual school ID
      />
    </div>
  );
}
