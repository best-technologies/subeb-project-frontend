"use client";
import React from "react";
import { Plus, School } from "lucide-react";

interface SchoolsHeaderProps {
  onAddSchool?: () => void;
}

const SchoolsHeader: React.FC<SchoolsHeaderProps> = ({ onAddSchool }) => {
  return (
    <div className="bg-brand-primary-2 rounded-xl p-8 shadow-lg hover:opacity-95 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary-2-contrast mb-2 flex items-center gap-3">
            <School className="w-8 h-8 opacity-90" />
            Schools Management
          </h1>
          <p className="text-brand-primary-2-contrast/80 text-lg">
            Institutional directory, enrollment statistics, and performance analytics across Abia State
          </p>
        </div>
        <div className="flex-shrink-0">
          {onAddSchool && (
            <button
              type="button"
              onClick={onAddSchool}
              className="bg-white text-emerald-800 font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-emerald-50 hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-5 h-5 text-emerald-700" />
              <span>Add School</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolsHeader;
