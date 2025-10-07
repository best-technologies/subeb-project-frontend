"use client";
import React, { useState, useRef } from "react";

export interface TruncatedTextProps {
  /** The text content to display */
  text: string | null | undefined;
  /** Maximum number of characters before truncation */
  maxLength: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Custom ellipsis character(s) - defaults to "..." */
  ellipsis?: string;
  /** Whether to truncate at word boundaries - defaults to false */
  wordBoundary?: boolean;
  /** Whether to show tooltip on hover - defaults to true */
  showTooltip?: boolean;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength,
  className = "",
  ellipsis = "...",
  wordBoundary = false,
  showTooltip = true,
}) => {
  const [showFullTooltip, setShowFullTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLSpanElement>(null);

  // Handle null/undefined/empty text
  if (!text || typeof text !== "string") {
    return <span className={className}>-</span>;
  }

  // If text is shorter than maxLength, return as is
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  // Truncate the text
  const truncateText = (str: string, max: number): string => {
    if (str.length <= max) return str;

    let truncated = str.substring(0, max);

    if (wordBoundary) {
      // Find the last space to avoid cutting words
      const lastSpace = truncated.lastIndexOf(" ");
      if (lastSpace > 0 && lastSpace > max * 0.5) {
        truncated = truncated.substring(0, lastSpace);
      }
    }

    return truncated;
  };

  const truncatedText = truncateText(text, maxLength);
  const displayText = truncatedText + ellipsis;

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (!showTooltip) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowFullTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowFullTooltip(false);
  };

  return (
    <>
      <span
        ref={textRef}
        className={`cursor-help ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={showTooltip ? text : undefined}
      >
        {displayText}
      </span>

      {/* Custom tooltip for better UX */}
      {showTooltip && showFullTooltip && (
        <div
          className="fixed z-50 max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="break-words">{text}</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </>
  );
};

export default TruncatedText;
