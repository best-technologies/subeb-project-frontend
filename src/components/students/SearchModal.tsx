"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  loading?: boolean;
  onSearchAll?: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  resultsCount,
  loading = false,
  onSearchAll,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        onSearchChange(localSearchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, onSearchChange]);

  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearchAll = () => {
    if (onSearchAll) {
      onSearchAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative z-10 bg-white rounded-xl w-full max-w-md mx-auto shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-primary-2 rounded-t-xl p-4">
          <h3 className="text-lg font-semibold text-brand-primary-2-contrast">
            Search Students
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, exam number, school, or class..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10 bg-brand-accent/10 border-brand-accent/20 text-brand-accent-text placeholder-brand-light-accent-1 focus:ring-brand-accent/40 mb-0"
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-accent"></div>
                ) : (
                  <Search className="h-4 w-4 text-brand-light-accent-1" />
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          {localSearchTerm && (
            <div className="mb-4 text-sm text-brand-accent-text">
              {loading ? (
                "Searching..."
              ) : resultsCount > 0 ? (
                <div>
                  <div className="font-medium">
                    {resultsCount} result{resultsCount !== 1 ? "s" : ""} found
                  </div>
                  <div className="text-xs text-brand-light-accent-1 mt-1">
                    Click 'OK' to view them in the table below
                  </div>
                </div>
              ) : (
                <div className="text-brand-accent-text">
                  No results found for "{localSearchTerm}"
                </div>
              )}
            </div>
          )}

          {/* No Results Message */}
          {localSearchTerm && !loading && resultsCount === 0 && (
            <div className="mb-4 p-3 bg-brand-accent/10 rounded-lg">
              <p className="text-sm text-brand-accent-text mb-2">
                No students found matching "{localSearchTerm}" in current
                results.
              </p>
              <p className="text-xs text-brand-light-accent-1">
                Try searching the entire database for more results, or modify
                your search terms.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-b-xl p-4 flex gap-3 justify-end">
          {/* Search All Button - Show when there's a search term */}
          {localSearchTerm && (
            <Button
              onClick={handleSearchAll}
              variant="secondary"
              size="sm"
              className="bg-brand-secondary hover:bg-brand-secondary/90 text-brand-secondary-contrast"
            >
              Search All Records
            </Button>
          )}

          {/* OK Button */}
          <Button
            onClick={onClose}
            variant="default"
            size="sm"
            className="bg-brand-primary hover:bg-brand-primary-2 text-brand-primary-contrast"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
