'use client';
import React from 'react';
import { getPageNumbers } from './utils/studentUtils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        First
      </button>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        Prev
      </button>
      {getPageNumbers(currentPage, totalPages).map((num, idx) =>
        num === '...'
          ? <span key={idx} className="px-2 text-gray-400">...</span>
          : <button
              key={num as number}
              onClick={() => onPageChange(num as number)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === num ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-blue-700 hover:text-white'}`}
            >
              {num}
            </button>
      )}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${currentPage === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        Last
      </button>
    </div>
  );
};

export default PaginationControls;
