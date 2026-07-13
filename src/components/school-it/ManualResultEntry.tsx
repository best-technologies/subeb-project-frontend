import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { useSchoolItStudents, useSchoolItSubjects, useUploadSchoolItResults } from "@/services/hooks/useSchoolIt";

interface ManualResultEntryProps {
  onSuccess: () => void;
  onCancel: () => void;
  dashboardData: any;
  existingResults?: any[];
}

export function ManualResultEntry({ onSuccess, onCancel, dashboardData, existingResults }: ManualResultEntryProps) {
  const [open, setOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});

  const { data: studentsData, isLoading: isLoadingStudents } = useSchoolItStudents({ limit: 1000 });
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSchoolItSubjects();
  const uploadMutation = useUploadSchoolItResults();

  const students = studentsData?.data || [];
  const subjects = subjectsData || [];

  const availableStudents = useMemo(() => {
    if (!existingResults || existingResults.length === 0) return students;
    return students.filter((s: any) => {
      const existingStudent = existingResults.find((r: any) => r.id === s.id);
      return !existingStudent || !existingStudent.assessments || existingStudent.assessments.length === 0;
    });
  }, [students, existingResults]);

  const selectedStudent = useMemo(() => {
    return students.find((s: any) => s.id === selectedStudentId);
  }, [selectedStudentId, students]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !dashboardData?.school || !dashboardData?.activeSession || !dashboardData?.activeTerm) {
      return;
    }

    const payload = {
      sessionId: dashboardData.activeSession.id,
      termId: dashboardData.activeTerm.id,
      lgaId: dashboardData.school.lgaId,
      schoolId: dashboardData.school.id,
      classId: selectedStudent.classId,
      students: [
        {
          studentId: selectedStudent.id,
          subjects: Object.entries(scores).map(([subjectId, score]) => ({
            subjectId,
            score
          }))
        }
      ]
    };

    uploadMutation.mutate(payload, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Select Student</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoadingStudents}
            >
              {selectedStudentId
                ? `${selectedStudent?.firstName} ${selectedStudent?.lastName} (${selectedStudent?.studentId})`
                : isLoadingStudents 
                  ? "Loading students..." 
                  : "Search for a student..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search student name or ID..." />
              <CommandList>
                <CommandEmpty>No ungraded students found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {availableStudents.map((student: any) => (
                    <CommandItem
                      key={student.id}
                      value={`${student.firstName} ${student.lastName} ${student.studentId}`}
                      onSelect={() => {
                        setSelectedStudentId(student.id);
                        setOpen(false);
                        setScores({}); // Reset scores when a new student is selected
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStudentId === student.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{student.firstName} {student.lastName}</span>
                        <span className="text-xs text-gray-500">{student.studentId} • {student.class?.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedStudent && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800">
            <strong>Selected Student:</strong> {selectedStudent.firstName} {selectedStudent.lastName} <br />
            <strong>Student ID:</strong> {selectedStudent.studentId} <br />
            <strong>Class:</strong> {selectedStudent.class?.name || "N/A"}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Enter Subject Scores</h3>
            {isLoadingSubjects ? (
              <p className="text-sm text-gray-500">Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-gray-500">No subjects found for this school level.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
                {subjects.map((subject: any) => (
                  <div key={subject.id} className="space-y-1">
                    <Label htmlFor={subject.id} className="text-xs truncate" title={subject.name}>
                      {subject.name}
                    </Label>
                    <Input
                      id={subject.id}
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={scores[subject.id] === undefined ? "" : scores[subject.id]}
                      onChange={(e) => handleScoreChange(subject.id, e.target.value)}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!selectedStudentId || uploadMutation.isPending || Object.keys(scores).length === 0}>
          {uploadMutation.isPending ? 'Uploading...' : 'Submit Results'}
        </Button>
      </div>
    </form>
  );
}
