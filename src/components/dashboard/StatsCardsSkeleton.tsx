import React from "react";
import {
  Calendar,
  Layers,
  MapPin,
  School,
  Users,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const StatsCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Academic Session & Term Card */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/40 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Academic Period</h3>
                <p className="text-xs text-gray-500">Current active schedule</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/90 rounded-lg p-3 border border-emerald-100/80 shadow-2xs text-center">
              <span className="text-xs font-medium text-gray-500 block mb-1">Session</span>
              <div className="h-5 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-emerald-100/80 shadow-2xs text-center">
              <span className="text-xs font-medium text-gray-500 block mb-1">Term</span>
              <div className="h-5 w-24 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. State Educational Overview Card */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50/80 via-white to-teal-100/40 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">State Overview</h3>
                <p className="text-xs text-gray-500">Total educational facilities</p>
              </div>
            </div>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              Abia State
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-white/90 rounded-lg p-2.5 border border-teal-100/80 text-center">
              <div className="flex items-center justify-center mb-1 text-teal-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="h-5 w-8 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <span className="text-[11px] font-medium text-gray-500">LGAs</span>
            </div>
            <div className="bg-white/90 rounded-lg p-2.5 border border-teal-100/80 text-center">
              <div className="flex items-center justify-center mb-1 text-teal-600">
                <School className="w-4 h-4" />
              </div>
              <div className="h-5 w-10 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <span className="text-[11px] font-medium text-gray-500">Schools</span>
            </div>
            <div className="bg-white/90 rounded-lg p-2.5 border border-teal-100/80 text-center">
              <div className="flex items-center justify-center mb-1 text-teal-600">
                <Users className="w-4 h-4" />
              </div>
              <div className="h-5 w-14 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <span className="text-[11px] font-medium text-gray-500">Students</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Students by Gender Distribution Card */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/40 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Students by Gender</h3>
                <p className="text-xs text-gray-500">Enrollment ratio</p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/90 rounded-lg p-3 border border-indigo-100/80 text-center">
              <span className="text-xs font-medium text-blue-600 flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Male
              </span>
              <div className="h-5 w-16 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <div className="h-3 w-14 bg-gray-200/70 rounded mx-auto animate-pulse" />
            </div>
            <div className="bg-white/90 rounded-lg p-3 border border-indigo-100/80 text-center">
              <span className="text-xs font-medium text-pink-600 flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Female
              </span>
              <div className="h-5 w-16 bg-gray-200 rounded mx-auto mb-1 animate-pulse" />
              <div className="h-3 w-14 bg-gray-200/70 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCardsSkeleton;
