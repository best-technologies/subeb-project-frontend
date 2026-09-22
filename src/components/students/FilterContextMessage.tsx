import React from "react";
import { Info } from "lucide-react";
import { formatEducationalText } from "@/utils/formatters";

export interface FilterContextParams {
  lgaName?: string;
  schoolName?: string;
  className?: string;
  sessionName?: string;
  termName?: string;
  searchTerm?: string;
}

export const buildFilterContextMessage = ({
  lgaName,
  schoolName,
  className,
  sessionName,
  termName,
  searchTerm,
}: FilterContextParams): string => {
  // Determine the academic period prefix
  let periodText = "";
  if (sessionName || termName) {
    const parts = [];
    if (sessionName) parts.push(`Session ${sessionName}`);
    if (termName) parts.push(formatEducationalText(termName.replace(/_/g, " ")));
    periodText = `for ${parts.join(", ")} `;
  }

  // Handle the case where search is used with or without filters
  if (searchTerm && searchTerm.trim()) {
    if (lgaName || schoolName || className) {
      // Search with filters
      const filterParts = [];
      if (lgaName) filterParts.push(`${formatEducationalText(lgaName)} LGA`);
      if (schoolName) filterParts.push(formatEducationalText(schoolName));
      if (className) filterParts.push(formatEducationalText(className));

      return `You're now viewing students ${periodText}from ${filterParts.join(
        " > "
      )} matching "${searchTerm}"`;
    } else {
      // Search only
      return `Showing students ${periodText}matching "${searchTerm}"`;
    }
  }

  // Handle the case where all three filters are applied (class is selected)
  if (lgaName && schoolName && className) {
    return `You're now viewing students ${periodText}from ${formatEducationalText(
      lgaName
    )} LGA > ${formatEducationalText(schoolName)} > ${formatEducationalText(className)}`;
  }

  return "";
};

interface FilterContextMessageProps extends FilterContextParams {
  isVisible: boolean;
}

const FilterContextMessage: React.FC<FilterContextMessageProps> = ({
  lgaName,
  schoolName,
  className,
  sessionName,
  termName,
  searchTerm,
  isVisible,
}) => {
  if (!isVisible) return null;

  const message = buildFilterContextMessage({
    lgaName,
    schoolName,
    className,
    sessionName,
    termName,
    searchTerm,
  });

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
