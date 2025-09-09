"use client";
import React from "react";
import { getPageNumbers } from "./utils/studentUtils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${
          currentPage === 1
            ? "bg-brand-light-accent-1/20 text-brand-light-accent-1 cursor-not-allowed"
            : "bg-brand-primary text-brand-primary-contrast hover:bg-brand-primary-2"
        }`}
      >
        First
      </button>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${
          currentPage === 1
            ? "bg-brand-light-accent-1/20 text-brand-light-accent-1 cursor-not-allowed"
            : "bg-brand-primary text-brand-primary-contrast hover:bg-brand-primary-2"
        }`}
      >
        Prev
      </button>
      {getPageNumbers(currentPage, totalPages).map((num, idx) =>
        num === "..." ? (
          <span key={idx} className="px-2 text-brand-light-accent-1">
            ...
          </span>
        ) : (
          <button
            key={num as number}
            onClick={() => onPageChange(num as number)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              currentPage === num
                ? "bg-brand-secondary text-brand-secondary-contrast"
                : "bg-brand-accent text-brand-accent-contrast hover:bg-brand-primary hover:text-brand-primary-contrast"
            }`}
          >
            {num}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${
          currentPage === totalPages
            ? "bg-brand-light-accent-1/20 text-brand-light-accent-1 cursor-not-allowed"
            : "bg-brand-primary text-brand-primary-contrast hover:bg-brand-primary-2"
        }`}
      >
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md font-medium transition-colors ${
          currentPage === totalPages
            ? "bg-brand-light-accent-1/20 text-brand-light-accent-1 cursor-not-allowed"
            : "bg-brand-primary text-brand-primary-contrast hover:bg-brand-primary-2"
        }`}
      >
        Last
      </button>
    </div>
  );
};

export default PaginationControls;
