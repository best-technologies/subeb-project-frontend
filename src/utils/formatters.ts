/**
 * Utility function to capitalize the first letter of each word in a string
 * @param str - The input string to format
 * @returns The formatted string with each word capitalized
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Utility function to format student names, school names, and class names
 * This function handles common formatting patterns for educational data
 * @param str - The input string to format
 * @returns The formatted string with proper capitalization
 */
export const formatEducationalText = (str: string): string => {
  if (!str) return '';
  
  // Handle special cases for educational terms
  const specialCases: Record<string, string> = {
    'primary': 'Primary',
    'secondary': 'Secondary',
    'jss': 'JSS',
    'sss': 'SSS',
    'ss': 'SS',
    'js': 'JS',
    'eccde': 'ECCDE',
    'crs': 'CRS',
    'cca': 'CCA',
    'igbo': 'Igbo',
    'english': 'English',
    'maths': 'Mathematics',
    'mathematics': 'Mathematics',
    'basic science': 'Basic Science',
    'social studies': 'Social Studies',
    'cultural & creative arts': 'Cultural & Creative Arts',
    'christian religious studies': 'Christian Religious Studies',
    'civic education': 'Civic Education',
    'computer studies': 'Computer Studies',
    'agricultural science': 'Agricultural Science',
    'home economics': 'Home Economics',
    'physical & health education': 'Physical & Health Education',
    'national values': 'National Values',
    'basic science and technology': 'Basic Science and Technology',
    'general norms': 'General Norms',
    'letter work': 'Letter Work',
    'number work': 'Number Work',
    'rhyme': 'Rhyme',
    'igbo language': 'Igbo Language',
    'english language': 'English Language',
    'prevocational': 'Prevocational'
  };

  const lowerStr = str.toLowerCase();
  
  // Check for special cases first
  for (const [key, value] of Object.entries(specialCases)) {
    if (lowerStr.includes(key)) {
      return str.replace(new RegExp(key, 'gi'), value);
    }
  }
  
  // Apply general capitalization
  return capitalizeWords(str);
}; 