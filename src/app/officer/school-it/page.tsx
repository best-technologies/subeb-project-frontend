"use client";

import React, { useState, useMemo } from "react";
import {
  useExamOfficerSchoolItList,
  useExamOfficerSchools,
  useToggleSchoolItStatus,
} from "@/services/hooks/useExamOfficer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Laptop,
  Mail,
  Phone,
  School as SchoolIcon,
  MoreVertical,
  Edit2,
  Power,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import CreateSchoolItModal from "@/components/officer/CreateSchoolItModal";
import EditSchoolItModal from "@/components/officer/EditSchoolItModal";

export interface SchoolItRecord {
  id: string;
  schoolItId: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  profilePicture?: string | null;
  createdAt: string;
  school?: {
    id: string;
    name: string;
    code: string;
    level: string;
    lgaName: string;
  } | null;
  creatorOfficer?: {
    id: string;
    name: string;
    officerId: string;
  } | null;
  isCreatedByCurrentOfficer: boolean;
}

export interface SchoolOption {
  id: string;
  name: string;
  code: string;
  level: string;
  lgaId: string;
  lgaName: string;
  studentCount: number;
  assignedIt?: {
    id: string;
    name: string;
    schoolItId: string;
    email: string;
  } | null;
  hasAssignedIt: boolean;
}

type StatusTab = "ALL" | "ACTIVE" | "INACTIVE" | "MINE";

export default function ExamOfficerSchoolItPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<SchoolItRecord | null>(null);

  const {
    data: personnelList = [],
    isLoading,
    refetch,
    isRefetching,
  } = useExamOfficerSchoolItList();

  const { data: schools = [] } = useExamOfficerSchools();
  const toggleStatusMutation = useToggleSchoolItStatus();

  // Filter client-side
  const filteredList = useMemo(() => {
    return (personnelList as SchoolItRecord[]).filter((item: SchoolItRecord) => {
      // Status filter
      if (activeTab === "ACTIVE" && !item.isActive) return false;
      if (activeTab === "INACTIVE" && item.isActive) return false;
      if (activeTab === "MINE" && !item.isCreatedByCurrentOfficer) return false;

      // School filter
      if (selectedSchoolFilter !== "ALL" && item.school?.id !== selectedSchoolFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const fullName = `${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
        const email = (item.email || "").toLowerCase();
        const phone = (item.phone || "").toLowerCase();
        const itId = (item.schoolItId || "").toLowerCase();
        const schoolName = (item.school?.name || "").toLowerCase();
        const schoolCode = (item.school?.code || "").toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          itId.includes(q) ||
          schoolName.includes(q) ||
          schoolCode.includes(q)
        );
      }

      return true;
    });
  }, [personnelList, activeTab, selectedSchoolFilter, searchTerm]);

  // Summary Metrics
  const typedList = personnelList as SchoolItRecord[];
  const typedSchools = schools as SchoolOption[];
  const totalCount = typedList.length;
  const activeCount = typedList.filter((p: SchoolItRecord) => p.isActive).length;
  const inactiveCount = totalCount - activeCount;
  const myCreatedCount = typedList.filter((p: SchoolItRecord) => p.isCreatedByCurrentOfficer).length;
  const schoolsWithItCount = new Set(typedList.map((p: SchoolItRecord) => p.school?.id).filter(Boolean)).size;
  const totalSchoolsCount = typedSchools.length;
  const unassignedSchoolsCount = Math.max(0, totalSchoolsCount - schoolsWithItCount);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            School IT Personnel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, assign, and manage School IT officers across schools in your assigned LGA jurisdiction
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs font-medium px-3.5 py-2.5 flex items-center gap-2 border-gray-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-brand-primary text-white hover:bg-brand-primary/90 font-medium px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} />
            <span>Create School IT</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row (Compact, proportionate cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total School IT */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total School IT
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {totalCount}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Registered in your LGA</p>
          </div>
        </div>

        {/* Assigned Schools */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Assigned Schools
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <SchoolIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {schoolsWithItCount}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Of {totalSchoolsCount} total schools
            </p>
          </div>
        </div>

        {/* Schools Needing IT */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Schools Needing IT
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
              {unassignedSchoolsCount}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Awaiting IT assignment</p>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Active Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
              {activeCount}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {inactiveCount > 0 ? `${inactiveCount} inactive` : "100% active"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        {/* Controls Row: Search + School Filter + Status Tabs */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "ALL"
                  ? "bg-white text-gray-900 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "ACTIVE"
                  ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("INACTIVE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "INACTIVE"
                  ? "bg-white text-gray-700 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
            <button
              onClick={() => setActiveTab("MINE")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "MINE"
                  ? "bg-white text-brand-primary shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Created by You ({myCreatedCount})
            </button>
          </div>

          {/* Search + School Filter */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, SIT, school..."
                className="pl-9 h-9 text-xs rounded-xl border-gray-200"
              />
            </div>

            {/* School Filter Dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={selectedSchoolFilter}
                onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                className="w-full h-9 text-xs border border-gray-200 rounded-xl px-2.5 bg-white text-gray-700 focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                <option value="ALL">All Schools ({totalSchoolsCount})</option>
                {typedSchools.map((school: SchoolOption) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <Table>
            <TableHeader className="bg-gray-50/75">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                  School IT Officer
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                  Assigned School
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                  Contact Information
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 py-3.5">
                  Attribution
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 py-3.5 text-center">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 py-3.5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-brand-primary" />
                      <span>Loading School IT personnel records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                        <Laptop className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {searchTerm || selectedSchoolFilter !== "ALL" || activeTab !== "ALL"
                          ? "No matching personnel found"
                          : "No School IT Personnel Registered Yet"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {searchTerm || selectedSchoolFilter !== "ALL" || activeTab !== "ALL"
                          ? "Try clearing or broadening your search and filter criteria."
                          : "Create and assign your first School IT officer to a school in your LGA."}
                      </p>
                      {(!searchTerm && selectedSchoolFilter === "ALL" && activeTab === "ALL") && (
                        <Button
                          type="button"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="bg-brand-primary text-white text-xs font-semibold px-4 py-2 rounded-xl mt-2"
                        >
                          <Plus size={16} className="mr-1" />
                          <span>Create First Personnel</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((personnel: SchoolItRecord) => {
                  const initials = `${personnel.firstName?.[0] || ""}${personnel.lastName?.[0] || ""}`.toUpperCase() || "IT";

                  return (
                    <TableRow key={personnel.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* 1. Personnel Details */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 leading-snug">
                              {personnel.fullName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                                {personnel.schoolItId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Assigned School */}
                      <TableCell className="py-3.5">
                        {personnel.school ? (
                          <div>
                            <div className="text-xs font-semibold text-gray-900 leading-snug">
                              {personnel.school.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                                {personnel.school.code}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {personnel.school.level}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 italic">
                            Unassigned School
                          </span>
                        )}
                      </TableCell>

                      {/* 3. Contact Info */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1 text-xs">
                          <a
                            href={`mailto:${personnel.email}`}
                            className="flex items-center gap-1.5 text-gray-600 hover:text-brand-primary transition-colors truncate max-w-[200px]"
                            title={personnel.email}
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{personnel.email}</span>
                          </a>
                          <a
                            href={`tel:${personnel.phone}`}
                            className="flex items-center gap-1.5 text-gray-600 hover:text-brand-primary transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{personnel.phone || "-"}</span>
                          </a>
                        </div>
                      </TableCell>

                      {/* 4. Creator / Attribution */}
                      <TableCell className="py-3.5">
                        {personnel.isCreatedByCurrentOfficer ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Created by You</span>
                          </span>
                        ) : personnel.creatorOfficer ? (
                          <div className="text-xs text-gray-600">
                            <span className="text-[11px] text-gray-500 block">Created by:</span>
                            <span className="font-medium text-gray-800">
                              {personnel.creatorOfficer.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">
                            Admin Enrollment
                          </span>
                        )}
                      </TableCell>

                      {/* 5. Status */}
                      <TableCell className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            personnel.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              personnel.isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          <span>{personnel.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </TableCell>

                      {/* 6. Actions */}
                      <TableCell className="py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg border-gray-200 hover:bg-gray-50"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs">
                            <DropdownMenuItem
                              onClick={() => setEditingPersonnel(personnel)}
                              className="cursor-pointer flex items-center gap-2 py-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleStatusMutation.mutate(personnel.id)}
                              className={`cursor-pointer flex items-center gap-2 py-2 ${
                                personnel.isActive
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-emerald-600 hover:text-emerald-700"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>
                                {personnel.isActive ? "Deactivate Account" : "Activate Account"}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Modal */}
      <CreateSchoolItModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Edit Modal */}
      {editingPersonnel && (
        <EditSchoolItModal
          isOpen={!!editingPersonnel}
          personnel={editingPersonnel}
          onClose={() => setEditingPersonnel(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
