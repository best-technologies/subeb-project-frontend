/**
 * Utility function to capitalize the first letter of each word in a string
 * @param str - The input string to format
 * @returns The formatted string with each word capitalized
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Utility function to format student names, school names, and class names
 * This function handles common formatting patterns for educational data
 * @param str - The input string to format
 * @returns The formatted string with proper capitalization
 */
export const formatEducationalText = (str: string): string => {
  if (!str) return "";

  // Handle special cases for educational terms
  const specialCases: Record<string, string> = {
    primary: "Primary",
    secondary: "Secondary",
    jss: "JSS",
    sss: "SSS",
    ss: "SS",
    js: "JS",
    eccde: "ECCDE",
    crs: "CRS",
    cca: "CCA",
    igbo: "Igbo",
    english: "English",
    maths: "Mathematics",
    mathematics: "Mathematics",
    "basic science": "Basic Science",
    "social studies": "Social Studies",
    "cultural & creative arts": "Cultural & Creative Arts",
    "christian religious studies": "Christian Religious Studies",
    "civic education": "Civic Education",
    "computer studies": "Computer Studies",
    "agricultural science": "Agricultural Science",
    "home economics": "Home Economics",
    "physical & health education": "Physical & Health Education",
    "national values": "National Values",
    "basic science and technology": "Basic Science and Technology",
    "general norms": "General Norms",
    "letter work": "Letter Work",
    "number work": "Number Work",
    rhyme: "Rhyme",
    "igbo language": "Igbo Language",
    "english language": "English Language",
    prevocational: "Prevocational",
  };

  const lowerStr = str.toLowerCase();

  // Check for special cases first
  for (const [key, value] of Object.entries(specialCases)) {
    if (lowerStr.includes(key)) {
      return str.replace(new RegExp(key, "gi"), value);
    }
  }

  // Apply general capitalization
  return capitalizeWords(str);
};

/**
 * Utility function to capitalize initials of names while skipping words with numeric initials
 * This function works with variable-length names (first, middle, last names, school names, LGA names, etc.)
 * and skips processing only individual words that start with numbers to avoid incorrect formatting
 * @param name - The input name string to format
 * @returns The formatted name with properly capitalized initials, skipping only words with numeric initials
 */
export const capitalizeInitials = (name: string): string => {
  if (!name) return "";

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/); // Split by any whitespace

  // Process each word individually
  return words
    .map((word) => {
      if (!word) return word;

      const firstChar = word.charAt(0);

      // Skip processing if the word starts with a number
      if (/^\d/.test(firstChar)) {
        return word; // Return the word unchanged
      }

      const restOfWord = word.slice(1).toLowerCase();

      // Only capitalize if it's actually a letter
      if (/[a-zA-Z]/.test(firstChar)) {
        return firstChar.toUpperCase() + restOfWord;
      }

      // Return word as-is if first character is not a letter or number
      return word;
    })
    .join(" ");
};

// Utility function to join class names conditionally
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
