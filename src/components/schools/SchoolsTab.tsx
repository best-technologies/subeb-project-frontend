"use client";
import React, { useState, useMemo } from "react";
import { formatEducationalText } from "@/utils/formatters";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";
import {
  School,
  Users,
  ChartColumn,
  MapPin,
  Search,
  Trophy,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface SchoolStats {
  name: string;
  lga: string;
  totalStudents: number;
  averageScore: number;
  topPerformer: string;
  topScore: number;
  classDistribution: Record<string, number>;
  genderDistribution: { male: number; female: number };
  subjectAverages: Record<string, number>;
}

interface SchoolsTabProps {
  dashboardData: AdminDashboardData;
}

const SchoolsTab: React.FC<SchoolsTabProps> = ({ dashboardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedSchool, setSelectedSchool] = useState<SchoolStats | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  const schoolStats = useMemo(() => {
    const schools =
      dashboardData?.data?.schools || dashboardData?.schools || [];
    if (schools.length === 0) return [];

    const stats: SchoolStats[] = schools.map((school) => {
      // For now, we'll use the school data directly since we don't have student data per school
      // In a real implementation, you'd want to fetch students per school
      return {
        name: school.name,
        lga: school.lga || "Unknown",
        totalStudents: school.totalStudents,
        averageScore: 0, // Would need to calculate from student data
        topPerformer: "N/A",
        topScore: 0,
        classDistribution: {},
        genderDistribution: { male: 0, female: 0 },
        subjectAverages: {},
      };
    });

    return stats;
  }, [dashboardData]);

  const filteredAndSortedSchools = useMemo(() => {
    const filtered = schoolStats.filter((school) => {
      const search = searchTerm.trim().toLowerCase();
      const schoolName = school.name.trim().toLowerCase();
      const lga = school.lga.trim().toLowerCase();
      // Search term matches school name or LGA
      const matchesSearch = schoolName.includes(search) || lga.includes(search);
      // LGA filter is case-insensitive and trimmed
      const matchesLGA =
        !selectedLGA || lga === selectedLGA.trim().toLowerCase();
      return matchesSearch && matchesLGA;
    });

    // Sort schools
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof SchoolStats];
      const bValue = b[sortBy as keyof SchoolStats];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [schoolStats, searchTerm, selectedLGA, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-brand-secondary";
    if (score >= 70) return "text-brand-accent";
    if (score >= 60) return "text-brand-primary";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-brand-secondary/10 border-brand-secondary/20";
    if (score >= 70) return "bg-brand-accent/10 border-brand-accent/20";
    if (score >= 60) return "bg-brand-primary/10 border-brand-primary/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const totalStudents = schoolStats.reduce(
    (sum, school) => sum + school.totalStudents,
    0
  );
  const overallAverage = Math.round(
    schoolStats.reduce((sum, school) => sum + school.averageScore, 0) /
      schoolStats.length
  );
  const topSchools = schoolStats
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Schools Management Header */}
      <div className="bg-brand-primary-2 rounded-xl p-8 border border-brand-primary-2/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary-2-contrast mb-2">
              Schools Management
            </h1>
            <p className="text-brand-primary-2-contrast/80 text-lg">
              Comprehensive school analytics and performance insights
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-secondary">
                {filteredAndSortedSchools.length}
              </div>
              <div className="text-sm text-brand-primary-2-contrast/70">
                Total Schools
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary-2-contrast">
                {totalStudents}
              </div>
              <div className="text-sm text-brand-primary-2-contrast/70">
                Total Students
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Schools */}
      {topSchools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topSchools.map((school, index) => (
            <div
              key={school.name}
              className="bg-white border border-brand-accent/20 rounded-xl p-6 hover:border-brand-accent/40 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-brand-secondary/20 text-brand-secondary"
                      : index === 1
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "bg-brand-primary/20 text-brand-primary"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  Top Performer
                </span>
              </div>
              <h3 className="text-lg font-semibold text-brand-heading mb-1">
                {formatEducationalText(school.name)}
              </h3>
              <p className="text-brand-light-accent-1 text-sm mb-3">
                {school.lga}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={`text-xl font-bold ${getScoreColor(
                      school.averageScore
                    )}`}
                  >
                    {school.averageScore}%
                  </div>
                  <div className="text-xs text-brand-light-accent-1">
                    Average Score
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-primary">
                    {school.totalStudents}
                  </div>
                  <div className="text-xs text-brand-light-accent-1">
                    Students
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-brand-secondary rounded-xl p-6 border border-brand-secondary/20 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-secondary-contrast mb-3">
              Search Schools
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-secondary-contrast/10 border border-brand-secondary-contrast/20 rounded-lg pl-10 pr-4 py-3 text-brand-secondary-contrast placeholder-brand-secondary-contrast/60 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-brand-secondary-contrast/60" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-secondary-contrast mb-3">
              Filter by LGA
            </label>
            <select
              value={selectedLGA}
              onChange={(e) => setSelectedLGA(e.target.value)}
              className="w-full bg-brand-secondary-contrast/10 border border-brand-secondary-contrast/20 rounded-lg px-4 py-3 text-brand-secondary-contrast focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="">All LGAs</option>
              {(dashboardData?.data?.lgas || dashboardData?.lgas || []).map(
                (lga) => (
                  <option key={lga.id} value={lga.name}>
                    {lga.name}
                  </option>
                )
              ) || (
                <>
                  <option value="Awka North">Awka North</option>
                  <option value="Awka South">Awka South</option>
                  <option value="Anambra East">Anambra East</option>
                  <option value="Anambra West">Anambra West</option>
                  <option value="Anaocha">Anaocha</option>
                  <option value="Ayamelum">Ayamelum</option>
                  <option value="Dunukofia">Dunukofia</option>
                  <option value="Ekwusigo">Ekwusigo</option>
                  <option value="Idemili North">Idemili North</option>
                  <option value="Idemili South">Idemili South</option>
                  <option value="Ihiala">Ihiala</option>
                  <option value="Njikoka">Njikoka</option>
                  <option value="Nnewi North">Nnewi North</option>
                  <option value="Nnewi South">Nnewi South</option>
                  <option value="Ogbaru">Ogbaru</option>
                  <option value="Onitsha North">Onitsha North</option>
                  <option value="Onitsha South">Onitsha South</option>
                  <option value="Orumba North">Orumba North</option>
                  <option value="Orumba South">Orumba South</option>
                  <option value="Oyi">Oyi</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedLGA("");
                setSortBy("name");
                setSortOrder("asc");
              }}
              className="w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-brand-accent-background border border-brand-accent/20 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-primary-2">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-secondary transition-colors duration-200"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    <span>School</span>
                    {sortBy === "name" && (
                      <span className="text-brand-secondary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-secondary transition-colors duration-200"
                  onClick={() => handleSort("lga")}
                >
                  <div className="flex items-center gap-2">
                    <span>LGA</span>
                    {sortBy === "lga" && (
                      <span className="text-green-400">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-secondary transition-colors duration-200"
                  onClick={() => handleSort("totalStudents")}
                >
                  <div className="flex items-center gap-2">
                    <span>Students</span>
                    {sortBy === "totalStudents" && (
                      <span className="text-brand-secondary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-secondary transition-colors duration-200"
                  onClick={() => handleSort("averageScore")}
                >
                  <div className="flex items-center gap-2">
                    <span>Average</span>
                    {sortBy === "averageScore" && (
                      <span className="text-brand-secondary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider cursor-pointer hover:text-brand-secondary transition-colors duration-200"
                  onClick={() => handleSort("topScore")}
                >
                  <div className="flex items-center gap-2">
                    <span>Top Score</span>
                    {sortBy === "topScore" && (
                      <span className="text-brand-secondary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brand-primary-2-contrast uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAndSortedSchools.map((school) => (
                <tr
                  key={school.name}
                  className="hover:bg-brand-accent/5 transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                        <School className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-brand-heading group-hover:text-brand-primary transition-colors duration-200">
                          {formatEducationalText(school.name)}
                        </div>
                        <div className="text-sm text-brand-light-accent-1">
                          {school.lga}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-accent-contrast border border-brand-accent/30">
                      {school.lga}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-brand-primary">
                      {school.totalStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBgColor(
                        school.averageScore
                      )}`}
                    >
                      <span className={`${getScoreColor(school.averageScore)}`}>
                        {school.averageScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div
                        className={`text-sm font-semibold ${getScoreColor(
                          school.topScore
                        )}`}
                      >
                        {school.topScore}
                      </div>
                      <div className="text-xs text-brand-light-accent-1">
                        {school.topPerformer}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="link"
                      onClick={() => {
                        setSelectedSchool(school);
                        setShowDetails(true);
                      }}
                      className="text-brand-primary hover:text-brand-primary-2 p-0 h-auto font-medium"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* School Details Modal */}
      {selectedSchool && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <div className="bg-brand-accent-background">
            <div className="sticky top-0 bg-brand-primary-2 p-6 border-b border-brand-primary-2/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-secondary/20 rounded-full flex items-center justify-center">
                    <School className="w-6 h-6 text-brand-secondary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-brand-primary-2-contrast">
                      {formatEducationalText(selectedSchool.name)}
                    </h3>
                    <p className="text-brand-primary-2-contrast/70">
                      {selectedSchool.lga}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  className="text-brand-primary-2-contrast/70 hover:text-brand-primary-2-contrast hover:bg-brand-primary-2-contrast/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-primary-2 rounded-xl p-6 border border-brand-primary-2/20">
                  <div className="w-10 h-10 bg-brand-secondary/20 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-brand-secondary">
                    {selectedSchool.totalStudents}
                  </div>
                  <div className="text-sm text-brand-primary-2-contrast/70">
                    Total Students
                  </div>
                </div>

                <div className="bg-brand-accent rounded-xl p-6 border border-brand-accent/20">
                  <div className="w-10 h-10 bg-brand-accent-contrast/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-brand-accent-contrast" />
                  </div>
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      selectedSchool.averageScore
                    )}`}
                  >
                    {selectedSchool.averageScore}%
                  </div>
                  <div className="text-sm text-brand-accent-contrast/70">
                    Average Score
                  </div>
                </div>

                <div className="bg-brand-secondary rounded-xl p-6 border border-brand-secondary/20">
                  <div className="w-10 h-10 bg-brand-secondary-contrast/20 rounded-lg flex items-center justify-center mb-4">
                    <Trophy className="w-5 h-5 text-brand-secondary-contrast" />
                  </div>
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      selectedSchool.topScore
                    )}`}
                  >
                    {selectedSchool.topScore}
                  </div>
                  <div className="text-sm text-brand-secondary-contrast/70">
                    Top Score
                  </div>
                </div>
              </div>

              {/* School Info and Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-brand-accent/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-brand-heading mb-4 flex items-center">
                    <School className="w-5 h-5 mr-2 text-brand-primary" />
                    School Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-brand-accent/10">
                      <span className="text-brand-light-accent-1">
                        School Name
                      </span>
                      <span className="text-brand-heading font-medium text-right">
                        {formatEducationalText(selectedSchool.name)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-brand-accent/10">
                      <span className="text-brand-light-accent-1">LGA</span>
                      <span className="text-brand-heading font-medium">
                        {selectedSchool.lga}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-brand-light-accent-1">
                        Total Students
                      </span>
                      <span className="text-brand-heading font-medium">
                        {selectedSchool.totalStudents}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-brand-accent/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-brand-heading mb-4 flex items-center">
                    <ChartColumn className="w-5 h-5 mr-2 text-brand-primary" />
                    Performance Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-brand-accent/10">
                      <span className="text-brand-light-accent-1">
                        Average Score
                      </span>
                      <span
                        className={`text-brand-heading font-medium ${getScoreColor(
                          selectedSchool.averageScore
                        )}`}
                      >
                        {selectedSchool.averageScore}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-brand-accent/10">
                      <span className="text-brand-light-accent-1">
                        Top Performer
                      </span>
                      <span className="text-brand-heading font-medium">
                        {selectedSchool.topPerformer}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-brand-light-accent-1">
                        Top Score
                      </span>
                      <span
                        className={`text-brand-heading font-medium ${getScoreColor(
                          selectedSchool.topScore
                        )}`}
                      >
                        {selectedSchool.topScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Distribution */}
              <div className="bg-white border border-brand-accent/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-brand-heading mb-6 flex items-center">
                  <School className="w-5 h-5 mr-2 text-brand-primary" />
                  Class Distribution
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(selectedSchool.classDistribution).map(
                    ([className, count]) => (
                      <div
                        key={className}
                        className="bg-brand-secondary/10 rounded-lg p-4 border border-brand-secondary/20 hover:scale-105 transition-all duration-200"
                      >
                        <div className="text-sm text-brand-light-accent-1 mb-2">
                          {className}
                        </div>
                        <div className="text-2xl font-bold text-brand-secondary">
                          {count}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="bg-white border border-brand-accent/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-brand-heading mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-brand-primary" />
                  Gender Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-brand-primary-2 rounded-lg p-6 border border-brand-primary-2/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-brand-secondary/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-brand-secondary" />
                      </div>
                      <span className="text-sm text-brand-primary-2-contrast/70">
                        Male Students
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-brand-secondary">
                      {selectedSchool.genderDistribution.male}
                    </div>
                  </div>
                  <div className="bg-brand-accent rounded-lg p-6 border border-brand-accent/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-brand-accent-contrast/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-brand-accent-contrast" />
                      </div>
                      <span className="text-sm text-brand-accent-contrast/70">
                        Female Students
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-brand-accent-contrast">
                      {selectedSchool.genderDistribution.female}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Averages */}
              <div className="bg-white border border-brand-accent/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-brand-heading mb-6 flex items-center">
                  <ChartColumn className="w-5 h-5 mr-2 text-brand-primary" />
                  Subject Averages
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(selectedSchool.subjectAverages).map(
                    ([subject, average]) => (
                      <div
                        key={subject}
                        className={`rounded-lg p-4 border transition-all duration-200 hover:scale-105 ${getScoreBgColor(
                          average
                        )}`}
                      >
                        <div className="text-sm text-brand-light-accent-1 mb-2 capitalize">
                          {subject.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            average
                          )}`}
                        >
                          {average}%
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default SchoolsTab;
