"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { useGlobalAdminDashboard, useCurrentSession } from "@/services";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Download } from "lucide-react";

export default function GradeRecordPage() {
  const params = useParams();
  const { user } = useAuthStore();

  // Security: Verify the user is accessing their own records
  const userId = params.id as string;
  if (user && user.id !== userId) {
    notFound();
  }

  // Fetch data from API
  const { data: dashboardData, loading: dashboardLoading } =
    useGlobalAdminDashboard();
  const { session: currentSession, loading: sessionLoading } =
    useCurrentSession();

  // Filter states
  const [selectedYear, setSelectedYear] = useState("2024/2025");
  const [selectedTerm, setSelectedTerm] = useState("First");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock grades data (will be replaced with API)
  const [grades] = useState<
    Array<{
      id: string;
      studentName: string;
      examNumber: string;
      gender: string;
      subjectRecorded: string;
    }>
  >([]);

  // Extract data from API
  const schools = useMemo(
    () => dashboardData?.data?.schools || dashboardData?.schools || [],
    [dashboardData]
  );

  const lgas = useMemo(
    () =>
      dashboardData?.data?.lgas?.map((l: { name: string }) => l.name) ||
      dashboardData?.lgas?.map((l: { name: string }) => l.name) ||
      [],
    [dashboardData]
  );

  const classes = useMemo(
    () =>
      dashboardData?.data?.classes?.map((c: { name: string }) => c.name) ||
      dashboardData?.classes?.map((c: { name: string }) => c.name) ||
      [],
    [dashboardData]
  );

  // Filter schools by selected LGA
  const filteredSchools = useMemo(() => {
    if (!selectedLga || !schools) return [];
    return schools.filter(
      (school: { lga?: string }) => school.lga === selectedLga
    );
  }, [schools, selectedLga]);

  // Auto-populate from current session
  React.useEffect(() => {
    if (currentSession) {
      setSelectedYear(currentSession.name);
      const currentTerm = currentSession.terms.find(
        (t: { isCurrent: boolean; name: string }) => t.isCurrent
      );
      if (currentTerm) {
        const termName = currentTerm.name.includes("FIRST")
          ? "First"
          : currentTerm.name.includes("SECOND")
          ? "Second"
          : "Third";
        setSelectedTerm(termName);
      }
    }
  }, [currentSession]);

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download grades");
  };

  const isLoading = sessionLoading || dashboardLoading;
  const hasResults = grades.length > 0;

  return (
    <>
      <LoadingModal isOpen={isLoading} message="Loading grade records..." />

      {/* Main Content */}
      <div>
        <div className="max-w-7xl bg-white">
          {/* Filters Section */}
          <div className="bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold text-brand-black mb-6">
              Filter
            </h2>

            {/* First Row: Year, Term, LGA, School */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-brand-black-accent">
                  Academic Year
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full focus:ring-brand-green hover:border-brand-green/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-brand-green/20 text-brand-green">
                    <SelectItem
                      value="2024/2025"
                      className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5"
                    >
                      2024/2025
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-brand-black-accent">
                  Term
                </Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-full focus:ring-brand-green hover:border-brand-green/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-brand-green/20 text-brand-green">
                    <SelectItem
                      value="First"
                      className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5"
                    >
                      First
                    </SelectItem>
                    <SelectItem
                      value="Second"
                      className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5"
                    >
                      Second
                    </SelectItem>
                    <SelectItem
                      value="Third"
                      className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5"
                    >
                      Third
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-brand-black-accent">
                  Local Government Area
                </Label>
                <Select value={selectedLga} onValueChange={setSelectedLga}>
                  <SelectTrigger className="w-full focus:ring-brand-green hover:border-brand-green/40">
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent className="border-brand-green/20 text-brand-green">
                    {lgas.map((lga: string) => (
                      <SelectItem
                        key={lga}
                        value={lga}
                        className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5"
                      >
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-brand-black-accent">
                  School Name
                </Label>
                <Select
                  value={selectedSchool}
                  onValueChange={setSelectedSchool}
                  disabled={!selectedLga}
                >
                  <SelectTrigger
                    className={`w-full focus:ring-brand-green hover:border-brand-green/40 ${
                      !selectedLga ? "opacity-50" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent className="border-brand-green/20 text-brand-green">
                    {filteredSchools.map(
                      (school: { id: string; name: string }) => (
                        <SelectItem
                          key={school.id}
                          value={school.name}
                          className="focus:bg-brand-green/10 focus:text-brand-green hover:bg-brand-green/5"
                        >
                          {school.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search and Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 border p-4 pt-6 rounded-lg justify-between items-center">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search student name or exam number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex gap-3 mb-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 h-12"
                >
                  Filter
                  <FunnelIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white h-12"
                >
                  Download
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white p-6">
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing ({grades.length}) results for{" "}
                <span className="font-semibold text-gray-900">
                  &quot;{selectedSchool || "nill"}&quot;
                </span>{" "}
                school of{" "}
                <span className="font-semibold text-gray-900">
                  &quot;{selectedLga || "nill"}&quot;
                </span>{" "}
                LGA
              </p>
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F4F6F8]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-black-accent uppercase">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-black-accent uppercase">
                      Exam Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-black-accent uppercase">
                      Gender
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-brand-black-accent uppercase">
                      Subject Recorded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hasResults ? (
                    grades.map((grade, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {grade.studentName}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {grade.examNumber}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {grade.gender}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {grade.subjectRecorded}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-32 h-32 mb-4 opacity-20 relative">
                            <Image
                              src="/svgs/scroll-icon.svg"
                              alt="Scroll Icon"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-gray-600 text-sm max-w-md">
                            Looks like you have no results recorded. Once you
                            upload a result it will appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (shown when there are results) */}
            {hasResults && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Page 1 of 23</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    className="bg-brand-green hover:bg-brand-green/90 text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
