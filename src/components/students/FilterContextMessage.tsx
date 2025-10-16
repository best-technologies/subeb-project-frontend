import React from "react";
import { Info } from "lucide-react";

interface FilterContextMessageProps {
  lgaName?: string;
  schoolName?: string;
  className?: string;
  searchTerm?: string;
  isVisible: boolean;
}

const FilterContextMessage: React.FC<FilterContextMessageProps> = ({
  lgaName,
  schoolName,
  className,
  searchTerm,
  isVisible,
}) => {
  if (!isVisible) return null;

  const buildMessage = () => {
    // Handle the case where search is used with or without filters
    if (searchTerm && searchTerm.trim()) {
      if (lgaName || schoolName || className) {
        // Search with filters
        const filterParts = [];
        if (lgaName) filterParts.push(`${lgaName} LGA`);
        if (schoolName) filterParts.push(schoolName);
        if (className) filterParts.push(className);

        return `You're now viewing students from ${filterParts.join(
          " > "
        )} matching "${searchTerm}"`;
      } else {
        // Search only
        return `Showing students matching "${searchTerm}"`;
      }
    }

    // Handle the case where all three filters are applied (class is selected)
    if (lgaName && schoolName && className) {
      return `You're now viewing students from ${lgaName} LGA > ${schoolName} > ${className}`;
    }

    return "";
  };

  const message = buildMessage();

  if (!message) return null;

  return (
    <div className="bg-brand-accent-background border border-brand-accent/30 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-brand-accent mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-brand-accent-contrast font-medium text-sm">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FilterContextMessage;
