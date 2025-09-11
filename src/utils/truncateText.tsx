import React from "react";
import TruncatedText, {
  TruncatedTextProps,
} from "@/components/ui/TruncatedText";

// Predefined truncation presets for common use cases
export const TruncationPresets = {
  // Short text for table cells
  SHORT: 12,
  // Medium text for cards
  MEDIUM: 20,
  // Long text for descriptions
  LONG: 50,
  // Extra long for detailed content
  EXTRA_LONG: 100,
} as const;

// Specific presets for table columns
export const StudentNameText: React.FC<
  Omit<TruncatedTextProps, "maxLength">
> = (props) => <TruncatedText {...props} maxLength={12} />;

export const SchoolNameText: React.FC<Omit<TruncatedTextProps, "maxLength">> = (
  props
) => <TruncatedText {...props} maxLength={20} />;

export const ShortTruncatedText: React.FC<
  Omit<TruncatedTextProps, "maxLength">
> = (props) => <TruncatedText {...props} maxLength={TruncationPresets.SHORT} />;

export const MediumTruncatedText: React.FC<
  Omit<TruncatedTextProps, "maxLength">
> = (props) => (
  <TruncatedText
    {...props}
    maxLength={TruncationPresets.MEDIUM}
    wordBoundary={true}
  />
);

export const LongTruncatedText: React.FC<
  Omit<TruncatedTextProps, "maxLength">
> = (props) => (
  <TruncatedText
    {...props}
    maxLength={TruncationPresets.LONG}
    wordBoundary={true}
  />
);

// Utility function to safely format and truncate backend data
export const formatAndTruncate = (
  text: string | null | undefined,
  maxLength: number,
  options?: {
    fallback?: string;
    wordBoundary?: boolean;
    ellipsis?: string;
  }
) => {
  const {
    fallback = "-",
    wordBoundary = false,
    ellipsis = "...",
  } = options || {};

  if (!text || typeof text !== "string" || text.trim() === "") {
    return fallback;
  }

  const cleanText = text.trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  let truncated = cleanText.substring(0, maxLength);

  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 0 && lastSpace > maxLength * 0.5) {
      truncated = truncated.substring(0, lastSpace);
    }
  }

  return truncated + ellipsis;
};

export default TruncatedText;
