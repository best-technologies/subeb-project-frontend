'use client';
import React, { useState, useEffect } from 'react';
import PaginationControls from './PaginationControls';

interface StudentsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const StudentsSearch: React.FC<StudentsSearchProps> = ({
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  loading = false
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        onSearchChange(localSearchTerm);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, onSearchChange]);

  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-3">Search Students</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, exam number, school, or class..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <span className="text-gray-400">🔍</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-end">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentsSearch;
