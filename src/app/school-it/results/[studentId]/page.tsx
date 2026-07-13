"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSchoolItStudentResults, useSchoolItSubjects, useUploadSchoolItResults, useSchoolItDashboard } from "@/services/hooks/useSchoolIt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";

export default function StudentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const dashboardQuery = useSchoolItDashboard();
  const { data: student, isLoading: isLoadingStudent } = useSchoolItStudentResults(studentId);
  const { data: subjects, isLoading: isLoadingSubjects } = useSchoolItSubjects();
  const uploadMutation = useUploadSchoolItResults();

  const [scores, setScores] = useState<Record<string, number>>({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Initialize scores from existing assessments
  useEffect(() => {
    if (student && subjects && !initialLoadDone) {
      const existingScores: Record<string, number> = {};
      student.assessments?.forEach((assessment: any) => {
        existingScores[assessment.subjectId] = assessment.score;
      });
      setScores(existingScores);
      setInitialLoadDone(true);
    }
  }, [student, subjects, initialLoadDone]);

  const handleScoreChange = (subjectId: string, value: string) => {
    if (value === "") {
      setScores(prev => {
        const next = { ...prev };
        delete next[subjectId];
        return next;
      });
      return;
    }
    const numValue = parseInt(value, 10);
    setScores(prev => ({
      ...prev,
      [subjectId]: isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue))
    }));
  };

  const handleSave = () => {
    if (!student || !dashboardQuery.data?.school || !dashboardQuery.data?.activeSession || !dashboardQuery.data?.activeTerm) {
      return;
    }

    const payload = {
      sessionId: dashboardQuery.data.activeSession.id,
      termId: dashboardQuery.data.activeTerm.id,
      lgaId: dashboardQuery.data.school.lgaId,
      schoolId: dashboardQuery.data.school.id,
      classId: student.classId,
      students: [
        {
          studentId: student.id,
          subjects: Object.entries(scores).map(([subjectId, score]) => ({
            subjectId,
            score
          }))
        }
      ]
    };

    uploadMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/school-it/results");
      }
    });
  };

  if (isLoadingStudent || isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading student results...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-gray-500">Student not found.</p>
        <Button onClick={() => router.push("/school-it/results")}>Go Back</Button>
      </div>
    );
  }

  const assessments = student.assessments || [];
  const isAllApproved = assessments.length > 0 && assessments.every((a: any) => a.status === 'APPROVED');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/school-it/results")}>
            <ChevronLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">ID: {student.studentId} • Class: {student.class?.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={uploadMutation.isPending || isAllApproved || Object.keys(scores).length === 0} className="flex items-center gap-2">
          <Save size={18} />
          {uploadMutation.isPending ? 'Saving...' : 'Save Results'}
        </Button>
      </div>

      {isAllApproved && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          These results have been <strong>APPROVED</strong> and can no longer be edited.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subject Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects?.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No subjects available for this school level.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects?.map((subject: any) => {
                const existingAssessment = assessments.find((a: any) => a.subjectId === subject.id);
                const isApproved = existingAssessment?.status === 'APPROVED';

                return (
                  <div key={subject.id} className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <Label htmlFor={subject.id} className="text-sm font-medium text-gray-900 line-clamp-1" title={subject.name}>
                      {subject.name}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id={subject.id}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Not graded"
                        value={scores[subject.id] === undefined ? "" : scores[subject.id]}
                        onChange={(e) => handleScoreChange(subject.id, e.target.value)}
                        disabled={isApproved || isAllApproved}
                        className={`bg-white ${isApproved ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    {existingAssessment && (
                      <div className="text-xs font-medium mt-2 flex items-center justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          existingAssessment.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          existingAssessment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {existingAssessment.status.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
