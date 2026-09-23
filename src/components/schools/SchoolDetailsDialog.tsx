"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchoolDirectoryItem } from "@/services/types/schoolsDirectoryResponse";
import { formatEducationalText } from "@/utils/formatters";
import {
  School,
  MapPin,
  User,
  Phone,
  Mail,
  Users,
  Award,
  BookOpen,
  Calendar,
  Building2,
  Percent,
} from "lucide-react";

interface SchoolDetailsDialogProps {
  school: SchoolDirectoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  sessionName?: string;
  termName?: string;
}

export const SchoolDetailsDialog: React.FC<SchoolDetailsDialogProps> = ({
  school,
  isOpen,
  onClose,
  sessionName,
  termName,
}) => {
  if (!school) return null;

  const scoreBadgeColor =
    school.averageScore >= 75
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : school.averageScore >= 60
      ? "bg-teal-50 text-teal-700 border-teal-200"
      : school.averageScore >= 50
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : school.averageScore > 0
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-gray-50 text-gray-500 border-gray-200";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-200 bg-white/10 px-2 py-0.5 rounded">
                Code: {school.code}
              </span>
              <DialogTitle className="text-xl font-bold text-white mt-1">
                {formatEducationalText(school.name)}
              </DialogTitle>
              <DialogDescription className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3" />
                {formatEducationalText(school.lga?.name || "Abia State")} • {school.level} School
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-[10px] text-gray-500 block mb-1">Academic Avg</span>
              <span
                className={`inline-block font-bold text-base px-2 py-0.5 rounded border ${scoreBadgeColor}`}
              >
                {school.averageScore > 0 ? `${school.averageScore}%` : "N/A"}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">
                {school.assessedStudents} assessed
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
              <span className="text-[10px] text-gray-500 block mb-1">Enrollment</span>
              <span className="font-bold text-blue-900 text-base block">
                {school.totalStudents.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Students</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-center">
              <span className="text-[10px] text-gray-500 block mb-1">Classes</span>
              <span className="font-bold text-teal-900 text-base block">
                {school.totalClasses}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Active Streams</span>
            </div>
          </div>

          {/* School Details List */}
          <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
            <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider text-gray-400">
              Institutional Profile
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-gray-400 block">Principal / Head Teacher</span>
                  <span className="font-medium text-gray-900 truncate block">
                    {school.principalName ? formatEducationalText(school.principalName) : "Not Assigned"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-gray-400 block">Facility Capacity</span>
                  <span className="font-medium text-gray-900 truncate block">
                    {school.capacity ? `${school.capacity.toLocaleString()} desks` : "Standard"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-gray-400 block">Phone Contact</span>
                  <span className="font-medium text-gray-900 truncate block">
                    {school.phone || "Not on file"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-gray-400 block">Established</span>
                  <span className="font-medium text-gray-900 truncate block">
                    {school.establishedYear || "Government Primary"}
                  </span>
                </div>
              </div>
            </div>

            {school.address && (
              <div className="flex items-start gap-2 text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 mt-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Campus Address</span>
                  <span className="font-medium text-gray-900">{school.address}</span>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Period Note */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Academic Performance Period:</span>
            <span className="font-semibold text-gray-800">
              {sessionName || "Active Session"} • {termName || "All Terms"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
