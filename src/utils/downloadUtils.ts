/**
 * Utility functions for handling file downloads
 */

/**
 * Downloads a blob as a file with the specified filename
 * @param blob - The blob to download
 * @param filename - The name of the file to save
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  // Create a blob URL
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the blob URL
  window.URL.revokeObjectURL(url);
};

/**
 * Sanitizes a filename by removing invalid characters
 * @param filename - The filename to sanitize
 * @returns The sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove invalid characters and replace spaces with underscores
  return filename
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .trim();
};

/**
 * Generates a timestamped filename
 * @param baseName - The base name for the file
 * @param extension - The file extension (with or without dot)
 * @returns The timestamped filename
 */
export const generateTimestampedFilename = (
  baseName: string,
  extension: string
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  return `${sanitizeFilename(baseName)}_${timestamp}${ext}`;
};
